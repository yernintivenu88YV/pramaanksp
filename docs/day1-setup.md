# Day 1 — run this today

Exact order. Each step assumes the previous one succeeded before moving on.

1. **Install the Catalyst CLI.** Don't guess this command — it differs by OS and Catalyst updates it. Look up "Installing Catalyst CLI" on docs.catalyst.zoho.com and run whatever it currently says.

2. `catalyst login`

3. In the Catalyst console (not the CLI): confirm the project you're using was created on the **India Data Center**. This can't be changed after creation — check it now, not after Phase 2.

4. Locally:
   ```
   mkdir pramaan && cd pramaan
   catalyst init
   ```
   - Select your organization, then the project you created in step 3.
   - When asked which components to initialize, select **both Functions and Client**.

5. Add the first function:
   ```
   catalyst function:add
   ```
   - Runtime: **Python 3.12 or 3.13** — not 3.9, which is already in its deprecation window.
   - Name it `entity_resolution_fn`.
   - Entry point: `main.py`.
   - Let it install dependencies when prompted.

6. Copy `entity_resolution.py`, `test_entity_resolution.py`, and `demo_console.py` (all already built and tested in this conversation) into the `functions/entity_resolution_fn/` folder the CLI just created — alongside the `main.py` and `catalyst-config.json` it generated. Don't hand-write those two config files; let the CLI own them.

7. Open the `requirements.txt` the CLI created in that same folder and add:
   ```
   rapidfuzz
   ```
   Then, from inside `functions/entity_resolution_fn/`:
   ```
   pip install -r requirements.txt
   ```

8. Sanity-check the logic still runs standalone before wiring it into Catalyst's request/response handling:
   ```
   python3 test_entity_resolution.py
   ```
   You should see 1.00 precision/recall on auto-merges, 3 true negatives correctly rejected, 2 sent to review queue.

9. Wrap `resolve_pair` in the actual Catalyst handler inside `main.py`. The exact request/response method names will already be in the boilerplate the CLI generated — adapt this shape into it rather than replacing the file wholesale:
   ```python
   from entity_resolution import PersonRecord, resolve_pair

   def handler(request, response):
       body = request.get_json()  # confirm this exact method name against the generated boilerplate
       a = PersonRecord(**body["record_a"])
       b = PersonRecord(**body["record_b"])
       result = resolve_pair(a, b)
       response.set_status_code(200)
       response.set_content_type("application/json")
       response.send({
           "decision": result.decision.value,
           "score": None if result.score == float("inf") else result.score,
           "evidence": result.evidence,
       })
   ```

10. Test it locally before touching the console:
    ```
    catalyst run
    ```

11. In the Data Store section of the console, create tables in this order — everything after this depends on these three existing first: **Person → EntityResolution → CasePersonLink** (full schema in `data_store_schema.sql`, alongside this file).

12. Basic hygiene, before you write anything else: `git init`, one commit with everything above, a `.gitignore` for `__pycache__` and `node_modules`, and push to a repo the whole team can see today — not by the end of the week.

That's Phase 0, for real, not just described. Entity resolution — the piece everything else depends on — is already built, already tested, and now has a real bug-fix behind it. Next real build target is the case-twin scoring from the Technical Roadmap, layered on top of these canonical IDs once they exist in the actual Data Store.
