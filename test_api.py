import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print(f"📡 Testing Velox Proxima API at {BASE_URL}...")
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/")
        print(f"   [GET /] Status: {r.status_code}, Body: {r.json()['message']}")
    except Exception as e:
        print(f"❌ Could not connect to API: {e}")
        return

    # 2. Start a training job
    print("\n📦 Submitting training job for Iris dataset...")
    source = """
layer Dense (64)
layer ReLU ()
layer Dense (32)
layer ReLU ()
layer Dense (3)
train on iris
epochs 50
batch_size 16
loss cross_entropy
    """.strip()
    
    payload = {
        "source": source,
        "job_id": "iris_cloud_test"
    }
    
    r = requests.post(f"{BASE_URL}/train", json=payload)
    if r.status_code == 200:
        job_id = r.json()["job_id"]
        print(f"✅ Job submitted successfully! ID: {job_id}")
    else:
        print(f"❌ Submission failed: {r.text}")
        return

    # 3. Monitor for a bit
    print("\n⏳ Monitoring job status...")
    for _ in range(5):
        r = requests.get(f"{BASE_URL}/train/{job_id}")
        data = r.json()
        print(f"   Status: {data['status']}")
        if data["status"] == "completed":
            print(f"🎯 Training Finished! Accuracy: {data['results']['test_accuracy']:.2f}%")
            break
        time.sleep(2)
    
    # 4. Predict
    if data["status"] == "completed":
        print("\n🔮 Performing live inference on [5.1, 3.5, 1.4, 0.2] (Setosa)...")
        sample_features = [5.1, 3.5, 1.4, 0.2]
        r = requests.post(f"{BASE_URL}/predict/{job_id}", json=sample_features)
        print(f"   Prediction: Class {r.json()['prediction']}")

if __name__ == "__main__":
    test_api()
