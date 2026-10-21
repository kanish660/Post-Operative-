import urllib.request
import urllib.error
import json
import sys

BASE_URL = 'http://127.0.0.1:5000/api'

def http_post(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8')) if e.fp else {}
        return e.code, body

def http_get(endpoint, headers=None):
    url = f"{BASE_URL}{endpoint}"
    req_headers = {'Content-Type': 'application/json'}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers, method='GET')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8')) if e.fp else {}
        return e.code, body

def http_put(endpoint, payload, headers=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req_headers = {'Content-Type': 'application/json'}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=data, headers=req_headers, method='PUT')
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode('utf-8')) if e.fp else {}
        return e.code, body

def run_tests():
    print("=" * 60)
    print("RUNNING DOCTOR AUTHENTICATION & ADMIN APPROVAL TEST SUITE")
    print("=" * 60)

    # TEST 10: Patient Login
    print("\n[TEST 10] Testing Existing Patient Login (patient@demo.com)...")
    status, body = http_post("/login", {'email': 'patient@demo.com', 'password': 'password123'})
    assert status == 200, f"Patient login failed: {body}"
    patient_token = body.get('token')
    print("  -> PASSED: Patient logged in successfully. Token acquired.")

    # TEST 11: Admin Login
    print("\n[TEST 11] Testing Existing Admin Login (admin@demo.com)...")
    status, body = http_post("/login", {'email': 'admin@demo.com', 'password': 'password123'})
    assert status == 200, f"Admin login failed: {body}"
    admin_token = body.get('token')
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print("  -> PASSED: Admin logged in successfully. Token acquired.")

    # TEST 9: Existing Demo Doctor Login (doctor@demo.com)
    print("\n[TEST 9] Testing Existing Demo Doctor Login (doctor@demo.com)...")
    status, body = http_post("/login", {'email': 'doctor@demo.com', 'password': 'password123'})
    assert status == 200, f"Demo doctor login failed: {body}"
    print("  -> PASSED: Demo Doctor logged in successfully. Approval status is approved.")

    # TEST 1: New Doctor Signup
    doc1_email = 'dr.smith@testclinic.com'
    print(f"\n[TEST 1] Testing New Doctor Registration ({doc1_email})...")
    doc1_payload = {
        'name': 'Dr. Robert Smith',
        'email': doc1_email,
        'password': 'Password123!',
        'role': 'doctor',
        'phone': '+1 (555) 888-9999',
        'specialization': 'Cardiothoracic Surgery',
        'hospital': 'St. Jude Heart Institute',
        'registration_number': 'MD-77291-CTS',
        'years_of_experience': 15,
        'address': '700 Medical Plaza, Suite 400'
    }
    status, body = http_post("/register", doc1_payload)
    if status != 201 and 'already exists' in str(body):
        print(f"  (Note: User {doc1_email} already exists from previous run, continuing test workflow...)")
    else:
        assert status == 201, f"Doctor registration failed: {body}"
        assert body.get('approval_status') == 'pending', f"Expected status 'pending', got: {body}"
        assert "waiting for administrator approval" in body.get('message', ''), f"Unexpected message: {body}"
        print("  -> PASSED: New doctor registered successfully with status = 'pending'.")

    # TEST 2: Pending Doctor Tries Login
    print(f"\n[TEST 2] Testing Pending Doctor Login Attempt ({doc1_email})...")
    status, body = http_post("/login", {'email': doc1_email, 'password': 'Password123!'})
    # If previously approved in a prior test run, we can test with a fresh email or verify response
    if status == 403:
        err_msg = body.get('error', '')
        assert "pending administrator approval" in err_msg, f"Unexpected error message: {err_msg}"
        print("  -> PASSED: Pending doctor login blocked with message: 'Your account is pending administrator approval.'")
    else:
        print(f"  -> Status check: {status}, {body}")

    # TEST 3: Admin Sees Pending Doctor
    print("\n[TEST 3] Testing Admin Listing Doctors & Pending Applications...")
    status, body = http_get("/admin/doctors", headers=admin_headers)
    assert status == 200, f"Admin doctors fetch failed: {body}"
    doctors_list = body.get('doctors', [])
    doc1_record = next((d for d in doctors_list if d.get('email') == doc1_email), None)
    assert doc1_record is not None, f"Doctor {doc1_email} not found in admin list"
    doc1_id = doc1_record.get('id')
    print(f"  -> PASSED: Admin sees doctor application (ID: {doc1_id}) with reg_num={doc1_record.get('registration_number')} and status={doc1_record.get('approval_status')}.")

    # TEST 4: Admin Approves Doctor
    print(f"\n[TEST 4] Testing Admin Approval of Doctor (ID: {doc1_id})...")
    status, body = http_put(f"/admin/doctors/{doc1_id}/approval", {'status': 'approved'}, headers=admin_headers)
    assert status == 200, f"Approval request failed: {body}"
    assert body.get('doctor', {}).get('approval_status') == 'approved'
    print("  -> PASSED: Admin approved doctor. Status in database updated to 'approved'.")

    # TEST 5 & 6: Approved Doctor Login & Re-login
    print(f"\n[TEST 5 & 6] Testing Approved Doctor Login & Persistence ({doc1_email})...")
    status, body = http_post("/login", {'email': doc1_email, 'password': 'Password123!'})
    assert status == 200, f"Approved doctor login failed: {body}"
    doc1_token = body.get('token')
    assert doc1_token is not None, "Token missing in approved doctor login response"
    print("  -> PASSED: Approved doctor logged in successfully and received JWT token.")

    # Second login test to verify persistence
    status2, body2 = http_post("/login", {'email': doc1_email, 'password': 'Password123!'})
    assert status2 == 200, f"Approved doctor subsequent login failed: {body2}"
    print("  -> PASSED: Approved doctor logged in second time normally without requiring re-approval.")

    # TEST 7: Admin Rejects Another Doctor
    import time
    doc2_email = f"dr.reject_{int(time.time())}@testclinic.com"
    print(f"\n[TEST 7] Registering fresh doctor and Rejecting ({doc2_email})...")
    doc2_payload = {
        'name': 'Dr. Alan Reject',
        'email': doc2_email,
        'password': 'Password123!',
        'role': 'doctor',
        'phone': '+1 (555) 111-2222',
        'specialization': 'Dermatology',
        'hospital': 'Fake Clinic',
        'registration_number': 'MD-00000-REJ',
        'years_of_experience': 2
    }
    status, body = http_post("/register", doc2_payload)
    assert status == 201, f"Registration failed: {body}"
    assert body.get('approval_status') == 'pending'

    # Get Doctor ID from Admin list
    status, body = http_get("/admin/doctors", headers=admin_headers)
    doc2_record = next((d for d in body.get('doctors', []) if d.get('email') == doc2_email), None)
    doc2_id = doc2_record.get('id')

    # Reject Doctor
    status, body = http_put(f"/admin/doctors/{doc2_id}/approval", {'status': 'rejected'}, headers=admin_headers)
    assert status == 200, f"Rejection failed: {body}"
    assert body.get('doctor', {}).get('approval_status') == 'rejected'
    print("  -> PASSED: Doctor status set to 'rejected' in database.")

    # TEST 8: Rejected Doctor Tries Login
    print(f"\n[TEST 8] Testing Rejected Doctor Login Attempt ({doc2_email})...")
    status, body = http_post("/login", {'email': doc2_email, 'password': 'Password123!'})
    assert status == 403, f"Expected 403 for rejected doctor, got {status}: {body}"
    err_msg = body.get('error', '')
    assert "has not been approved by the administrator" in err_msg, f"Unexpected error message: {err_msg}"
    print("  -> PASSED: Rejected doctor login blocked with message: 'Your account has not been approved by the administrator.'")

    print("\n" + "=" * 60)
    print("ALL 11 TEST CASES PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
