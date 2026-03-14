import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # En producción (PORT distinto de 8000) no usar reload
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=(port == 8000),
    )
