# ADR-003: Bundle-Based Tool Distribution

## Status
Draft

## Notes for Discussion

### Key Decision Points
- **Bundle Format**: ZIP archives vs other container formats
- **Size Constraints**: 50MB limit enforcement and optimization
- **Dependency Management**: How to handle tool dependencies
- **Versioning Strategy**: Bundle versioning vs individual tool versioning
- **Distribution Mechanism**: How bundles get to users

### Important Aspects to Consider
1. **Bundle Contents**: What goes in a bundle? (code, data, docs, dependencies)
2. **Dependency Resolution**: Shared libraries vs embedded dependencies
3. **Security**: Bundle signing, validation, tamper detection
4. **Caching**: Browser caching of bundles vs always fresh
5. **Partial Loading**: Load parts of bundles on demand?
6. **Update Mechanism**: How to update bundles? Delta updates?
7. **Compatibility**: Cross-platform considerations
8. **Bundle Creation**: Tooling for creating bundles from repositories

### Options to Evaluate
- Self-contained bundles with all dependencies
- Layered bundles with shared dependency layer
- Streaming bundles with on-demand loading
- Registry-based distribution vs direct bundle loading

### Business Requirements Impact
- Tool contributor workflow
- Network bandwidth usage
- Offline operation requirements
- Bundle creation complexity