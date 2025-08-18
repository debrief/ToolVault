# ADR-006: Backend Technology Stack

## Status
Accepted

## Context

ToolVault requires a backend service that can:
1. Serve the static frontend SPA
2. Execute Python-based analysis tools
3. Provide REST API endpoints for tool discovery and execution
4. Support dual deployment modes (desktop via Debrief + shared server)
5. Handle file uploads/downloads and temporary file management
6. Scale from single user to small team usage (1-10 concurrent users)

### Team Constraints
- Strong Node.js development skills
- Modest Python scripting experience
- Need to execute Python tools natively
- Preference for rapid prototyping and development speed

## Decision

**Selected Technology Stack: FastAPI (Python)**

### Core Components
- **Web Framework**: FastAPI with uvicorn ASGI server
- **API Style**: REST with automatic OpenAPI documentation
- **Tool Execution**: Direct Python script/module execution within backend process
- **Static File Serving**: FastAPI's built-in static file serving
- **Jupyter Integration**: Deferred to Phase 2+ (focus on Python script execution initially)

## Rationale

### Why FastAPI over alternatives:

**FastAPI vs Flask:**
- Automatic API documentation generation (critical for tool discovery)
- Built-in data validation with Pydantic models
- Modern async support for better concurrency
- Better tooling and IDE support

**FastAPI vs Django:**
- Lower complexity overhead for API-focused application
- More flexible for custom tool execution workflows
- Faster startup time (important for desktop deployment)

**Python vs Node.js:**
- Required for native Python tool execution
- Simpler architecture (single runtime environment)
- Direct access to Python scientific computing ecosystem

### Implementation Strategy

**Phase 1: Core Backend**
```python
# FastAPI app structure
app = FastAPI(title="ToolVault API")

# Tool discovery endpoint
@app.get("/api/tools")

# Tool execution endpoint  
@app.post("/api/tools/{tool_id}/execute")

# Static file serving
app.mount("/", StaticFiles(directory="static", html=True))
```

**Phase 2: Enhanced Features**
- Jupyter notebook execution via REST API integration
- Enhanced security and sandboxing
- Performance optimization for larger deployments

### Deployment Architecture

**Desktop Mode (Debrief):**
- Single FastAPI process started by Debrief
- Serves on configurable localhost port
- Direct file system access for tool bundles

**Server Mode:**
- Same FastAPI application
- Deployed on shared infrastructure
- Multiple users access via network URL

## Consequences

### Positive
- Leverages existing Python ecosystem for tool execution
- Automatic API documentation aids development and integration
- Single technology stack reduces deployment complexity
- Good performance for target scale (1-10 users)
- Clear migration path from prototype to production

### Negative
- Team needs to develop Python web framework expertise
- Less familiar technology stack initially
- May need additional tooling for complex async operations

### Neutral
- Database requirements deferred to later phases
- Authentication handled at deployment level initially
- Jupyter integration delayed but not blocked

## Implementation Notes

### Dependencies
```python
# Core requirements
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.0.0

# Tool execution support
subprocess
pathlib
tempfile
```

### Development Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Development server
uvicorn main:app --reload --port 8000

# Production server  
uvicorn main:app --host 0.0.0.0 --port 8000
```