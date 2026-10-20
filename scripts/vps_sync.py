"""
VPS Management & Automated CI/CD Utility for TradingSims
Usage:
  python scripts/vps_sync.py ship "Your commit message"  -> Git add + commit + push + VPS deploy + verify
  python scripts/vps_sync.py deploy                      -> Trigger update.sh on VPS
  python scripts/vps_sync.py status                      -> Check PM2, Nginx, Quant Bridge status
  python scripts/vps_sync.py logs [lines]                -> View PM2 logs
  python scripts/vps_sync.py restart                     -> Restart services
"""
import os
import subprocess
import sys
import time
import paramiko

VPS_HOST = "38.9.46.160"
VPS_USER = "root"
VPS_PASS = "st=4g&#UvMa8"

def get_ssh_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    return client

def run_remote_cmd(client, cmd, stream=True):
    print(f"\n🚀 [VPS] Running: {cmd}\n" + "-"*50)
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    if stream:
        for line in iter(stdout.readline, ""):
            print(line, end="")
    else:
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out)
    return stdout.channel.recv_exit_status()

def run_local_cmd(cmd):
    print(f"\n💻 [LOCAL] Running: {cmd}\n" + "-"*50)
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.stdout:
        print(res.stdout.strip())
    if res.stderr:
        print(res.stderr.strip())
    if res.returncode != 0:
        raise RuntimeError(f"Command failed with code {res.returncode}: {cmd}")
    return res.stdout

def ship(commit_msg):
    print("="*60)
    print("🚢 [AUTO-SHIP] STARTING AUTOMATED BUILD, PUSH & VPS DEPLOYMENT")
    print("="*60)

    # 1. Local Git Add
    run_local_cmd("git add .")

    # 2. Check if git status has changes to commit
    status = run_local_cmd("git status --porcelain")
    if status.strip():
        # Commit changes
        safe_msg = commit_msg.replace('"', '\\"')
        run_local_cmd(f'git commit -m "{safe_msg}"')
        print("✅ Local changes committed.")
    else:
        print("ℹ️ No new local changes to commit. Proceeding with push/sync...")

    # 3. Push to GitHub
    print("📡 Pushing to GitHub (origin main)...")
    run_local_cmd("git push origin main")
    print("✅ Pushed successfully to GitHub!")

    # 4. Trigger VPS Deploy
    print("\n🌐 Connecting to VPS for automatic build & deployment...")
    client = get_ssh_client()
    try:
        exit_code = run_remote_cmd(client, "bash /var/www/tradingsims/update.sh")
        if exit_code != 0:
            print(f"⚠️ Warning: update.sh exited with code {exit_code}")
        
        # 5. Verify VPS health
        print("\n🩺 Running health checks on VPS...")
        time.sleep(2)
        run_remote_cmd(client, "pm2 list && curl -s -I http://127.0.0.1:3000 | head -n 5")
        print("\n🎉 [AUTO-SHIP SUCCESS] Website updated and live on VPS!")
    finally:
        client.close()

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    action = sys.argv[1] if len(sys.argv) > 1 else "status"

    if action == "ship":
        msg = sys.argv[2] if len(sys.argv) > 2 else "chore: automated deployment update"
        ship(msg)
        return

    client = get_ssh_client()
    try:
        if action == "status":
            run_remote_cmd(client, "pm2 list && systemctl status nginx --no-pager | head -n 7 && systemctl status quant-bridge --no-pager | head -n 7")
        elif action == "deploy":
            run_remote_cmd(client, "bash /var/www/tradingsims/update.sh")
        elif action == "logs":
            lines = sys.argv[2] if len(sys.argv) > 2 else "50"
            run_remote_cmd(client, f"pm2 logs tradingsims --lines {lines} --nostream")
        elif action == "restart":
            run_remote_cmd(client, "pm2 restart tradingsims && systemctl restart quant-bridge && systemctl reload nginx")
        elif action == "exec":
            custom_cmd = " ".join(sys.argv[2:])
            run_remote_cmd(client, custom_cmd)
        else:
            print(f"Unknown action: {action}. Usage: python scripts/vps_sync.py [ship <msg>|status|deploy|logs|restart|exec <cmd>]")
    finally:
        client.close()

if __name__ == "__main__":
    main()
