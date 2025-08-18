# ADR-011: Multi-Platform Embedding Strategy

## Status
Draft

## Notes for Discussion

### Key Decision Points
- **Embedding Methods**: iframe vs JavaScript widget vs web components
- **Communication**: PostMessage vs direct API vs event system
- **Styling**: How to handle CSS conflicts with parent applications
- **State Management**: How embedded instances share state
- **Platform-Specific Features**: Leveraging host application capabilities

### Important Aspects to Consider
1. **Target Platforms**: Debrief, Python IDEs, ArcGIS, VS Code requirements
2. **Security Boundaries**: Cross-origin restrictions and workarounds
3. **User Experience**: Seamless integration vs clearly separate tool
4. **Performance**: Impact of embedding on host application
5. **Development Complexity**: Maintaining multiple integration approaches
6. **Feature Parity**: Should embedded version have all features?
7. **Updates**: How to update embedded instances
8. **Debugging**: Development and troubleshooting embedded instances

### Options to Evaluate
- Single iframe solution for all platforms
- Platform-specific integration approaches
- Web components with Shadow DOM isolation
- JavaScript SDK with embedding flexibility
- Electron app for desktop integration

### Business Requirements Impact
- Integration effort with existing tools
- User workflow continuity
- Maintenance burden across platforms
- Feature development complexity