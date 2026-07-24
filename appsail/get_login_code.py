import subprocess
import re
import sys

def main():
    p = subprocess.Popen(['cmd.exe', '/c', 'catalyst login --no-localhost'], 
                         stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                         
    while True:
        line = p.stdout.readline()
        if not line and p.poll() is not None:
            break
        print(line, end='', flush=True)
        if "collect CLI error reporting" in line:
            p.stdin.write("n\n")
            p.stdin.flush()
        if "datacenter to which you have access" in line:
            p.stdin.write("\n")
            p.stdin.flush()
        if "verification code:" in line:
            match = re.search(r'code:\s+([A-Z0-9-]+)', line)
            if match:
                print(f"\n--- FOUND CODE: {match.group(1)} ---")
                break
                
    # Keep reading so the process doesn't block on full stdout pipe
    for line in iter(p.stdout.readline, ''):
        print(line, end='', flush=True)

if __name__ == "__main__":
    main()
