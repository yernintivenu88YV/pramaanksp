import subprocess
import sys
import re

def main():
    p = subprocess.Popen(['cmd.exe', '/c', 'catalyst login --no-localhost --dc in'], 
                         stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=False)
                         
    buffer = b""
    code = None
    
    while True:
        char = p.stdout.read(1)
        if not char and p.poll() is not None:
            break
        
        sys.stdout.buffer.write(char)
        sys.stdout.flush()
        
        buffer += char
        text = buffer.decode('utf-8', errors='ignore')
        
        if "collect CLI error reporting" in text:
            p.stdin.write(b"n\n")
            p.stdin.flush()
            buffer = b""  # Reset
            
        if "datacenter to which you have access" in text:
            p.stdin.write(b"\n")
            p.stdin.flush()
            buffer = b""
            
        if "verification code:" in text:
            # Device code is usually like XXXX-XXXX
            match = re.search(r'([A-Z0-9]{4}-[A-Z0-9]{4})', text)
            if match:
                code = match.group(1)
                print(f"\n--- FOUND CODE: {code} ---")
                break
                
    if code:
        url = "https://accounts.zoho.in/oauth/v3/device"
        print(f"Running playwright script with code: {code} at {url}")
        res = subprocess.run(["python", "appsail/login_script.py", code, url], capture_output=True, text=True)
        print("Playwright script output:")
        print(res.stdout)
        print(res.stderr)
        
        # Read remaining output until CLI exits
        import threading
        def consume():
            while True:
                c = p.stdout.read(1)
                if not c:
                    break
                sys.stdout.buffer.write(c)
                sys.stdout.flush()
        t = threading.Thread(target=consume)
        t.start()
        p.wait()
        t.join()

if __name__ == "__main__":
    main()
