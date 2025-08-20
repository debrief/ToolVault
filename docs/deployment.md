# ToolVault Deployment Guide

This document provides comprehensive instructions for deploying ToolVault to GitHub Pages, including Phase 0 JavaScript bundle integration.

## Deployment Architecture

ToolVault uses GitHub Actions for automated deployment to GitHub Pages with the following components:

- **Frontend**: React/TypeScript SPA built with Vite
- **Phase 0 Tools**: JavaScript bundle with 12 tools across 5 categories
- **Build Pipeline**: Automated testing, building, and deployment
- **Static Hosting**: GitHub Pages with SPA routing support

## Prerequisites

Before deployment, ensure:

1. **Repository Setup**
   - Repository has GitHub Pages enabled
   - Actions have write permissions for Pages deployment
   - All Phase 0 tools are functional and tested

2. **Build Requirements**
   - Node.js 20.x or later
   - Yarn package manager
   - All dependencies installed and up-to-date

## Deployment Process

### Automatic Deployment

The deployment is fully automated via GitHub Actions:

1. **Trigger Events**
   - Push to `main` branch
   - Manual workflow dispatch
   - Pull requests (build only, no deploy)

2. **Build Process**
   ```yaml
   # Installs dependencies
   yarn install --frozen-lockfile
   
   # Runs type checking
   yarn typecheck
   
   # Runs linting
   yarn lint
   
   # Builds production bundle
   GITHUB_PAGES=true yarn build
   
   # Copies Phase 0 JavaScript bundle
   cp -r examples/javascript-bundle toolvault-frontend/dist/examples/
   ```

3. **Testing Phase**
   - Runs complete Phase 0 tool test suite
   - Validates bundle structure and metadata
   - Ensures 100% test coverage

4. **Deployment**
   - Uploads build artifacts to GitHub Pages
   - Configures proper base path for subdirectory hosting
   - Enables SPA routing with 404.html fallback

### Manual Deployment

If needed, you can deploy manually:

```bash
# 1. Build the frontend
cd toolvault-frontend
GITHUB_PAGES=true yarn build

# 2. Copy Phase 0 bundle
cp -r ../examples/javascript-bundle dist/examples/

# 3. Test Phase 0 tools
cd ../examples/javascript-bundle
npm test -- --coverage --watchAll=false

# 4. Deploy (requires GitHub CLI)
gh workflow run deploy.yml
```

## Configuration Details

### Vite Configuration

The `vite.config.ts` includes GitHub Pages specific settings:

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' && process.env.GITHUB_PAGES ? '/ToolVault/' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    fs: {
      allow: ['..'], // Allow serving Phase 0 bundle during development
    },
  },
})
```

### SPA Routing Support

The `404.html` file handles client-side routing:

```html
<script>
  // Redirect to index.html with the path as a query parameter
  const path = window.location.pathname.substring(1);
  if (path && path !== 'index.html') {
    window.history.replaceState(null, null, '/ToolVault/');
    window.location.replace('/ToolVault/?route=' + encodeURIComponent(path));
  }
</script>
```

### Phase 0 Bundle Integration

The JavaScript bundle is integrated during build:

1. **Development**: Served from `../examples/javascript-bundle/` via Vite dev server
2. **Production**: Copied to `dist/examples/javascript-bundle/` during build
3. **Loading**: Dynamically loaded by the bundle service at runtime

## Environment Configuration

### Required Environment Variables

- `GITHUB_PAGES=true`: Enables production base path configuration
- `NODE_ENV=production`: Triggers production optimizations

### GitHub Repository Settings

1. **Pages Configuration**
   - Source: GitHub Actions
   - Custom domain: (optional)
   - Enforce HTTPS: Enabled

2. **Actions Permissions**
   - Read repository contents
   - Write to GitHub Pages
   - ID token permissions for deployment

## Build Optimization

### Bundle Size Optimization

The build process includes:

- **Tree Shaking**: Removes unused code
- **Code Splitting**: Separates vendor and application code
- **Asset Optimization**: Compresses images and fonts
- **Minification**: Reduces JavaScript and CSS file sizes

### Performance Considerations

- **Lazy Loading**: Components load on-demand
- **Bundle Caching**: Phase 0 tools cached after first load
- **Static Assets**: Served efficiently from CDN
- **Compression**: Gzip compression enabled

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check type errors
   yarn typecheck
   
   # Check linting issues  
   yarn lint
   
   # Verify Phase 0 tests
   cd examples/javascript-bundle && npm test
   ```

2. **404 Errors on Refresh**
   - Ensure `404.html` exists in `toolvault-frontend/public/`
   - Verify base path configuration in `vite.config.ts`
   - Check GitHub Pages settings use "GitHub Actions" source

3. **Phase 0 Tools Not Loading**
   - Verify bundle copied to `dist/examples/javascript-bundle/`
   - Check console for CORS or loading errors
   - Ensure `index.json` is accessible and valid

4. **Routing Issues**
   - Verify React Router configuration
   - Check base path matches GitHub Pages subdirectory
   - Test SPA fallback handling

### Debug Commands

```bash
# Check build output
ls -la toolvault-frontend/dist/

# Verify Phase 0 bundle
ls -la toolvault-frontend/dist/examples/javascript-bundle/

# Test local build
cd toolvault-frontend && yarn preview

# Check workflow status
gh workflow list
gh run list --workflow=deploy.yml
```

### Performance Monitoring

Monitor deployment performance:

1. **Build Times**: Check GitHub Actions logs
2. **Bundle Size**: Review build output and warnings  
3. **Load Times**: Test page performance with dev tools
4. **Error Rates**: Monitor GitHub Issues for user reports

## Updating Deployment

### Adding New Phase 0 Tools

1. Add tool implementation to `examples/javascript-bundle/tools/`
2. Update `index.json` metadata
3. Add comprehensive tests with 100% coverage
4. Commit changes to trigger automatic deployment

### Frontend Updates

1. Make changes in `toolvault-frontend/src/`
2. Run local testing: `yarn dev`
3. Verify type safety: `yarn typecheck`
4. Commit to `main` branch for automatic deployment

### Configuration Changes

1. Update `vite.config.ts` for build changes
2. Modify `.github/workflows/deploy.yml` for pipeline changes
3. Test locally before pushing to production

## Validation Checklist

Before considering deployment complete:

- [ ] All 12 Phase 0 tools load and execute correctly
- [ ] Tool discovery and search functionality works
- [ ] File upload/download capabilities function
- [ ] SPA routing works on all pages
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable (< 3s load time)
- [ ] No console errors or warnings
- [ ] All E2E tests pass
- [ ] Documentation is up-to-date

## Monitoring and Maintenance

### Regular Checks

1. **Weekly**: Review GitHub Actions for failed deployments
2. **Monthly**: Check bundle size and performance metrics
3. **Quarterly**: Update dependencies and security patches

### Issue Tracking

Use GitHub Issues with templates:
- Bug reports for deployment issues
- Feature requests for enhancement
- Tool feedback for Phase 0 functionality

### Backup Strategy

- **Source Code**: Backed up in GitHub repository
- **Build Artifacts**: Stored in GitHub Actions for 7 days
- **Documentation**: Version controlled with code

For additional support or questions, refer to the [GitHub Issues](https://github.com/your-username/ToolVault/issues) or project documentation.