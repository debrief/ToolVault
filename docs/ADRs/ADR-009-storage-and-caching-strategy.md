# ADR-009: Storage and Caching Strategy

## Status
Accepted

## Context

ToolVault requires a storage and caching strategy that supports:
1. Full offline operation after initial setup (networked but no internet)
2. Tool bundle distribution and management
3. Session-based execution with no persistent history
4. Dual deployment modes (desktop Debrief + shared server)
5. Automatic and manual bundle update mechanisms
6. Minimal complexity and maximum reliability

### Key Requirements
- **Offline-First**: Complete functionality without internet access
- **Network Resilience**: Graceful handling of connectivity issues
- **Privacy-Conscious**: No persistent storage of sensitive execution data
- **Maintenance-Free**: Minimal user intervention for storage management

## Decision

**Selected Strategy: Backend File System Storage with Zero Browser Persistence**

### Core Components
- **Tool Bundles**: File system storage managed by FastAPI backend
- **Execution History**: Session-only, no persistence across restarts
- **Browser Storage**: Completely avoided - no LocalStorage/IndexedDB usage
- **Updates**: Multi-modal approach (manual + startup check + background)

## Rationale

### Storage Architecture

**Single Bundle Storage:**
```
{bundle_root}/
├── tools/           # The bundle's tools and scripts
├── index.json      # Bundle metadata and tool definitions
└── dependencies/    # Any bundled dependencies (Python packages, etc.)
```

**Session-Only Execution Data:**
- Tool inputs/outputs handled in-memory by FastAPI process
- No persistent files created for execution data
- No execution history or user preferences stored

**Zero Browser Storage Policy:**
- No LocalStorage, IndexedDB, or SessionStorage usage
- All state flows through FastAPI backend
- Eliminates browser quota concerns and privacy issues

### Update Strategy

**Multi-Modal Bundle Updates:**
1. **Manual Updates**: User-initiated refresh via UI
2. **Startup Checks**: Automatic check for updates on application launch
3. **Background Updates**: Periodic checks during operation
4. **Graceful Failures**: Continue operation when update checks fail

```python
# Update handling pseudocode
async def check_bundle_updates():
    try:
        # Attempt update check
        available_updates = await fetch_bundle_updates()
        if available_updates:
            notify_user_of_updates(available_updates)
    except NetworkError:
        # Fail silently, continue with existing bundles
        log_update_failure()
        continue_normal_operation()
```

### Deployment-Specific Storage

**Desktop Mode (Debrief):**
- Bundle location: User-configurable bundle directory
- Configuration: `~/.toolvault/config.json` (if needed)
- Each ToolVault instance serves one bundle

**Server Mode:**
- Bundle location: Specified bundle directory (e.g., `/opt/toolvault-bundles/geospatial-tools/`)
- Configuration: Environment variables or command line arguments
- Multiple ToolVault instances can serve different bundles on different ports

## Implementation Details

### Bundle Management
```python
# FastAPI endpoints for single bundle
@app.get("/api/tools")
async def list_tools():
    """Return tools from this ToolVault's bundle"""

@app.post("/api/bundle/refresh")  
async def refresh_bundle():
    """Check for and download bundle updates"""

@app.get("/api/bundle/info")
async def get_bundle_info():
    """Return bundle metadata from index.json"""
```

### Tool Execution
```python
# In-memory tool execution
@app.post("/api/tools/{tool_id}/execute")
async def execute_tool(tool_id: str, inputs: dict):
    """Execute tool with inputs, return results in-memory"""
    # No temporary files needed - all handled in memory
```

### Update Mechanisms
```python
# Update checking service
class BundleUpdateService:
    async def startup_check(self):
        """Check for updates on application start"""
    
    async def background_check(self):
        """Periodic background update checking"""
    
    async def manual_refresh(self):
        """User-triggered update check"""
```

## Consequences

### Positive
- **Offline Reliability**: Complete functionality without internet
- **Privacy Protection**: No persistent storage of sensitive data
- **Storage Simplicity**: No browser quota management needed
- **Cross-Platform**: File system storage works on all deployment targets
- **Update Flexibility**: Multiple update mechanisms for different use cases

### Negative
- **No Persistence**: Users lose work on session end (by design)
- **File System Dependency**: Requires write access to local storage
- **No Cross-Device Sync**: Work doesn't sync between different installations

### Neutral
- **Backend Dependency**: All storage operations require FastAPI backend
- **Temporary Storage**: Large datasets create temporary storage requirements
- **Update Network Usage**: Background updates consume bandwidth when available

## Monitoring and Management

### Storage Monitoring
- Track bundle storage usage (informational only, no limits)  
- Monitor bundle update attempts and failures
- Log bundle access and tool execution statistics

### User Controls
- Manual bundle refresh button
- Bundle update notifications
- Bundle information display

### Bundle Portability
- Bundles are self-contained directories that can be copied between systems
- Each ToolVault instance points to one bundle directory
- Organizations can share bundles by copying bundle directories
- No cleanup needed - execution is purely in-memory