import http.server
import socketserver
import json
import os
import sys
import time
import shutil
import webbrowser
import threading

PORT = 8080

# ── CRITICAL: Set working directory to this script's folder ──────
# When double-clicking the file, Windows sets CWD to the Python install
# folder, not the project folder. This fixes that so all static files
# (index.html, css/, js/, etc.) are served correctly.
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(PROJECT_ROOT)


class ContentEngineHandler(http.server.SimpleHTTPRequestHandler):
    """Serves static files + handles local API endpoints."""

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        """Cleaner console output."""
        print(f"  {args[0]}")

    def do_POST(self):
        if self.path == '/api/generate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
                archetype_id = payload.get('archetype_id', 'custom')
                piece = payload.get('piece', 'piece_001')

                print(f"[*] Local generation request for {piece} - {archetype_id}")

                output_filename = f"{piece}_{archetype_id}_{int(time.time())}.png"
                output_path = os.path.join(PROJECT_ROOT, "output", "rings", output_filename)
                enhanced_path = os.path.join(PROJECT_ROOT, "assets", "enhanced", output_filename)

                # Copy a reference image as placeholder
                source_image = os.path.join(PROJECT_ROOT, "references", "rings", "Ring_organic_sand.jpeg")
                if os.path.exists(source_image):
                    shutil.copy(source_image, output_path)
                    shutil.copy(source_image, enhanced_path)

                # Update manifest.json
                manifest_path = os.path.join(PROJECT_ROOT, "assets", "enhanced", "manifest.json")
                if os.path.exists(manifest_path):
                    with open(manifest_path, 'r', encoding='utf-8') as f:
                        manifest = json.load(f)

                    manifest['files'].append({
                        "file": output_filename,
                        "name": f"Local Gen: {archetype_id}",
                        "direction": archetype_id,
                        "archetype": "Generated via Prompt Studio",
                        "reference": "local"
                    })

                    with open(manifest_path, 'w', encoding='utf-8') as f:
                        json.dump(manifest, f, indent=2)

                response_data = {
                    "status": "success",
                    "file": output_filename,
                    "message": "Asset saved locally."
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()


def open_browser():
    """Opens the browser after a short delay to let the server start."""
    time.sleep(0.8)
    url = f"http://localhost:{PORT}"
    print(f"[*] Opening browser -> {url}")
    webbrowser.open(url)


if __name__ == '__main__':
    # Ensure output directories exist
    os.makedirs(os.path.join(PROJECT_ROOT, "output", "rings"), exist_ok=True)
    os.makedirs(os.path.join(PROJECT_ROOT, "assets", "enhanced"), exist_ok=True)

    print()
    print("  +----------------------------------------------+")
    print("  |     ELARIS CONTENT ENGINE - Local Server      |")
    print("  +----------------------------------------------+")
    print(f"  |  URL:  http://localhost:{PORT}                |")
    print("  |  Mode: Local (no external APIs)               |")
    print("  |                                               |")
    print("  |  Press Ctrl+C or close this window to stop    |")
    print("  +----------------------------------------------+")
    print()

    try:
        socketserver.ThreadingTCPServer.allow_reuse_address = True
        with socketserver.ThreadingTCPServer(("", PORT), ContentEngineHandler) as httpd:
            # Auto-open browser in a background thread
            threading.Thread(target=open_browser, daemon=True).start()
            httpd.serve_forever()

    except OSError as e:
        if "address already in use" in str(e).lower() or "10048" in str(e):
            print(f"\n  [!] Port {PORT} is already in use.")
            print(f"  [*] The server might already be running.")
            print(f"  [*] Try opening http://localhost:{PORT} in your browser.")
            print(f"\n  Or close the other program using port {PORT} and try again.")
        else:
            print(f"\n  [!] Server error: {e}")

    except KeyboardInterrupt:
        print("\n  [*] Server stopped.")

    except Exception as e:
        print(f"\n  [!] Unexpected error: {e}")

    # Keep the window open so the user can read any errors
    print()
    input("  Press Enter to close this window...")
