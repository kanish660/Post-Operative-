import urllib.request
import urllib.error
import sys

VITE_URL = 'http://localhost:5173'

routes_to_test = [
    '/',
    '/login',
    '/doctor/login',
    '/patient/login',
    '/admin/login',
    '/register',
    '/patient/signup',
    '/doctor/signup'
]

def test_routes():
    print("=" * 60)
    print("VERIFYING FRONTEND ROUTING ON VITE DEV SERVER (PORT 5173)")
    print("=" * 60)

    for route in routes_to_test:
        url = f"{VITE_URL}{route}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                html = resp.read().decode('utf-8')
                assert status == 200, f"Route {route} failed with status {status}"
                assert '<div id="root">' in html, f"Route {route} missing React root div"
                print(f"  [200 OK] {route} -> Successfully loaded React application bundle")
        except Exception as e:
            print(f"  [FAILED] {route} -> {e}")
            sys.exit(1)

    print("\n" + "=" * 60)
    print("ALL FRONTEND ROUTES ARE FULLY REACHABLE AND SERVED PROPERLY!")
    print("=" * 60)

if __name__ == '__main__':
    test_routes()
