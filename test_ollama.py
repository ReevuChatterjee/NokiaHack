import httpx
import asyncio

async def test_ollama():
    try:
        print("Testing connection to Ollama at http://localhost:11434/api/tags...")
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            if response.status_code == 200:
                print("✅ SUCESS: Backend can reach Ollama!")
            else:
                print("❌ FAILED: Backend reached Ollama but got error.")
    except Exception as e:
        print(f"❌ FAILED: Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(test_ollama())
