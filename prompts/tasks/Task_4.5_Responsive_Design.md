# APM Task Assignment: Responsive Design and Mobile Optimization

## 1. Task Assignment

**Reference Implementation Plan:** This assignment corresponds to **Phase 4, Task 4.5** in the Implementation Plan (`Implementation_Plan.md`).

**Objective:** Ensure optimal experience across all device types and screen sizes with comprehensive responsive design, mobile-specific interactions, performance optimization, and adaptive UI components.

**Prerequisites:** Tasks 4.1-4.4 completed - Mock backend, enhanced search, output rendering, and tool execution should be fully functional.

## 2. Detailed Action Steps

1. **Implement Comprehensive Responsive Design:**
   - Create responsive breakpoint system:
     ```typescript
     // src/theme/responsive.ts
     export const breakpoints = {
       xs: 0,      // Mobile portrait
       sm: 600,    // Mobile landscape / small tablet
       md: 900,    // Tablet
       lg: 1200,   // Desktop
       xl: 1536,   // Large desktop
     };
     
     export const responsiveTheme = createTheme({
       breakpoints: {
         values: breakpoints,
       },
       components: {
         MuiContainer: {
           styleOverrides: {
             root: {
               '@media (max-width: 600px)': {
                 paddingLeft: 16,
                 paddingRight: 16,
               },
             },
           },
         },
         MuiCard: {
           styleOverrides: {
             root: {
               '@media (max-width: 600px)': {
                 margin: '8px 0',
                 borderRadius: 8,
               },
             },
           },
         },
       },
     });
     
     // Responsive hook for component logic
     export function useResponsive() {
       const theme = useTheme();
       const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
       const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
       const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
       const isTouchDevice = useMediaQuery('(pointer: coarse)');
       
       return {
         isMobile,
         isTablet,
         isDesktop,
         isTouchDevice,
         breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
       };
     }
     ```

   - Implement responsive layouts for all major components:
     ```typescript
     // src/components/layout/ResponsiveToolList.tsx
     export function ResponsiveToolList({ tools }: ResponsiveToolListProps) {
       const { isMobile, isTablet, isDesktop } = useResponsive();
       const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
       
       const getGridColumns = () => {
         if (isMobile) return 1;
         if (isTablet) return 2;
         return 3;
       };
       
       const getCardHeight = () => {
         if (isMobile) return 'auto';
         return 280;
       };
       
       return (
         <Box>
           {/* View Mode Toggle - Hidden on mobile */}
           {!isMobile && (
             <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
               <ToggleButtonGroup
                 value={viewMode}
                 exclusive
                 onChange={(_, newMode) => newMode && setViewMode(newMode)}
                 size="small"
               >
                 <ToggleButton value="grid">
                   <GridViewIcon />
                 </ToggleButton>
                 <ToggleButton value="list">
                   <ViewListIcon />
                 </ToggleButton>
               </ToggleButtonGroup>
             </Box>
           )}
           
           {/* Responsive Grid */}
           <Grid container spacing={isMobile ? 1 : 2}>
             {tools.map((tool) => (
               <Grid 
                 item 
                 xs={12}
                 sm={viewMode === 'list' ? 12 : 6}
                 md={viewMode === 'list' ? 12 : 4}
                 lg={viewMode === 'list' ? 12 : 3}
                 key={tool.id}
               >
                 <ResponsiveToolCard
                   tool={tool}
                   height={getCardHeight()}
                   compact={isMobile || viewMode === 'list'}
                 />
               </Grid>
             ))}
           </Grid>
         </Box>
       );
     }
     ```

2. **Create Mobile-Specific Interactions:**
   - Implement touch-friendly controls and gestures:
     ```typescript
     // src/components/mobile/TouchInteractions.tsx
     export function TouchInteractions({ children }: TouchInteractionsProps) {
       const { isTouchDevice } = useResponsive();
       
       if (!isTouchDevice) return <>{children}</>;
       
       return (
         <Box
           sx={{
             '& .MuiButton-root': {
               minHeight: 44, // Minimum touch target
               minWidth: 44,
               padding: '12px 16px',
             },
             '& .MuiIconButton-root': {
               minHeight: 44,
               minWidth: 44,
               padding: 12,
             },
             '& .MuiChip-root': {
               minHeight: 32,
               '& .MuiChip-deleteIcon': {
                 minHeight: 24,
                 minWidth: 24,
               },
             },
           }}
         >
           {children}
         </Box>
       );
     }
     
     // src/hooks/useSwipeGestures.ts
     export function useSwipeGestures(
       onSwipeLeft?: () => void,
       onSwipeRight?: () => void,
       threshold = 50
     ) {
       const [touchStart, setTouchStart] = useState<number | null>(null);
       const [touchEnd, setTouchEnd] = useState<number | null>(null);
       
       const onTouchStart = (e: TouchEvent) => {
         setTouchEnd(null);
         setTouchStart(e.targetTouches[0].clientX);
       };
       
       const onTouchMove = (e: TouchEvent) => {
         setTouchEnd(e.targetTouches[0].clientX);
       };
       
       const onTouchEnd = () => {
         if (!touchStart || !touchEnd) return;
         
         const distance = touchStart - touchEnd;
         const isLeftSwipe = distance > threshold;
         const isRightSwipe = distance < -threshold;
         
         if (isLeftSwipe && onSwipeLeft) {
           onSwipeLeft();
         }
         if (isRightSwipe && onSwipeRight) {
           onSwipeRight();
         }
       };
       
       return {
         onTouchStart,
         onTouchMove,
         onTouchEnd,
       };
     }
     
     // src/components/mobile/SwipeableToolCard.tsx
     export function SwipeableToolCard({ tool, onView, onBookmark }: SwipeableToolCardProps) {
       const swipeHandlers = useSwipeGestures(
         () => onBookmark?.(tool), // Swipe left to bookmark
         () => onView(tool)        // Swipe right to view
       );
       
       return (
         <Card
           {...swipeHandlers}
           sx={{
             position: 'relative',
             overflow: 'hidden',
             '&:active': {
               transform: 'scale(0.98)',
             },
           }}
         >
           <CardContent>
             {/* Card content */}
           </CardContent>
           
           {/* Swipe Indicators */}
           <Box
             sx={{
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: 2,
               opacity: 0.7,
               pointerEvents: 'none',
             }}
           >
             <Typography variant="caption" color="primary">
               ← View
             </Typography>
             <Typography variant="caption" color="secondary">
               Bookmark →
             </Typography>
           </Box>
         </Card>
       );
     }
     ```

3. **Optimize Performance for Mobile Devices:**
   - Implement connection-aware features and lazy loading:
     ```typescript
     // src/hooks/useConnectionAware.ts
     export function useConnectionAware() {
       const [connectionType, setConnectionType] = useState<string>('unknown');
       const [saveData, setSaveData] = useState(false);
       const [isSlowConnection, setIsSlowConnection] = useState(false);
       
       useEffect(() => {
         if ('connection' in navigator) {
           const connection = (navigator as any).connection;
           
           const updateConnection = () => {
             setConnectionType(connection.effectiveType);
             setSaveData(connection.saveData);
             setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType));
           };
           
           updateConnection();
           connection.addEventListener('change', updateConnection);
           
           return () => {
             connection.removeEventListener('change', updateConnection);
           };
         }
       }, []);
       
       return {
         connectionType,
         saveData,
         isSlowConnection,
         shouldOptimize: saveData || isSlowConnection,
       };
     }
     
     // src/components/mobile/AdaptiveImageLoader.tsx
     export function AdaptiveImageLoader({ 
       src, 
       alt, 
       lowQualitySrc,
       ...props 
     }: AdaptiveImageLoaderProps) {
       const { shouldOptimize } = useConnectionAware();
       const [imageLoaded, setImageLoaded] = useState(false);
       const [currentSrc, setCurrentSrc] = useState(
         shouldOptimize && lowQualitySrc ? lowQualitySrc : src
       );
       
       useEffect(() => {
         if (shouldOptimize && lowQualitySrc && !imageLoaded) {
           // Load low quality first
           setCurrentSrc(lowQualitySrc);
           
           // Then load high quality
           const highQualityImage = new Image();
           highQualityImage.onload = () => {
             setCurrentSrc(src);
             setImageLoaded(true);
           };
           highQualityImage.src = src;
         }
       }, [src, lowQualitySrc, shouldOptimize, imageLoaded]);
       
       return (
         <img
           {...props}
           src={currentSrc}
           alt={alt}
           loading="lazy"
           style={{
             ...props.style,
             transition: 'opacity 0.3s ease-in-out',
             opacity: imageLoaded || !shouldOptimize ? 1 : 0.8,
           }}
         />
       );
     }
     
     // src/components/mobile/ProgressiveToolList.tsx
     export function ProgressiveToolList({ tools }: ProgressiveToolListProps) {
       const { shouldOptimize } = useConnectionAware();
       const [visibleCount, setVisibleCount] = useState(shouldOptimize ? 5 : 12);
       const [isLoading, setIsLoading] = useState(false);
       
       const loadMore = useCallback(async () => {
         setIsLoading(true);
         // Simulate network delay for demonstration
         await new Promise(resolve => setTimeout(resolve, 500));
         setVisibleCount(prev => prev + (shouldOptimize ? 3 : 8));
         setIsLoading(false);
       }, [shouldOptimize]);
       
       return (
         <Box>
           <ResponsiveToolList tools={tools.slice(0, visibleCount)} />
           
           {visibleCount < tools.length && (
             <Box sx={{ textAlign: 'center', mt: 2 }}>
               <Button
                 onClick={loadMore}
                 disabled={isLoading}
                 startIcon={isLoading ? <CircularProgress size={20} /> : null}
               >
                 Load More ({tools.length - visibleCount} remaining)
               </Button>
             </Box>
           )}
         </Box>
       );
     }
     ```

4. **Create Adaptive UI Components:**
   - Build components that adapt to screen size and device capabilities:
     ```typescript
     // src/components/adaptive/AdaptiveNavigation.tsx
     export function AdaptiveNavigation() {
       const { isMobile, isTablet } = useResponsive();
       const [mobileOpen, setMobileOpen] = useState(false);
       
       const handleDrawerToggle = () => {
         setMobileOpen(prev => !prev);
       };
       
       if (isMobile) {
         return (
           <>
             <AppBar position="fixed">
               <Toolbar>
                 <IconButton
                   color="inherit"
                   aria-label="open drawer"
                   edge="start"
                   onClick={handleDrawerToggle}
                 >
                   <MenuIcon />
                 </IconButton>
                 <Typography variant="h6" noWrap component="div">
                   ToolVault
                 </Typography>
               </Toolbar>
             </AppBar>
             
             <Drawer
               variant="temporary"
               open={mobileOpen}
               onClose={handleDrawerToggle}
               ModalProps={{ keepMounted: true }}
               sx={{
                 '& .MuiDrawer-paper': {
                   boxSizing: 'border-box',
                   width: 280,
                 },
               }}
             >
               <MobileNavigationContent onClose={handleDrawerToggle} />
             </Drawer>
           </>
         );
       }
       
       return (
         <Drawer
           variant="permanent"
           sx={{
             width: isTablet ? 200 : 240,
             flexShrink: 0,
             '& .MuiDrawer-paper': {
               width: isTablet ? 200 : 240,
               boxSizing: 'border-box',
             },
           }}
         >
           <DesktopNavigationContent />
         </Drawer>
       );
     }
     
     // src/components/adaptive/AdaptiveToolDetail.tsx
     export function AdaptiveToolDetail({ tool }: AdaptiveToolDetailProps) {
       const { isMobile } = useResponsive();
       const [activeTab, setActiveTab] = useState(0);
       
       if (isMobile) {
         return (
           <Box>
             <Tabs
               value={activeTab}
               onChange={(_, newValue) => setActiveTab(newValue)}
               variant="fullWidth"
             >
               <Tab label="Overview" />
               <Tab label="Execute" />
               <Tab label="Results" />
             </Tabs>
             
             <TabPanel value={activeTab} index={0}>
               <ToolOverview tool={tool} />
             </TabPanel>
             <TabPanel value={activeTab} index={1}>
               <ExecutionPanel tool={tool} />
             </TabPanel>
             <TabPanel value={activeTab} index={2}>
               <ResultsPanel tool={tool} />
             </TabPanel>
           </Box>
         );
       }
       
       return (
         <Grid container spacing={3}>
           <Grid item xs={12} md={4}>
             <ToolOverview tool={tool} />
           </Grid>
           <Grid item xs={12} md={8}>
             <ExecutionPanel tool={tool} />
             <Box sx={{ mt: 3 }}>
               <ResultsPanel tool={tool} />
             </Box>
           </Grid>
         </Grid>
       );
     }
     
     // src/components/adaptive/AdaptiveSearch.tsx
     export function AdaptiveSearch({ onSearch, onFilter }: AdaptiveSearchProps) {
       const { isMobile } = useResponsive();
       const [filtersOpen, setFiltersOpen] = useState(false);
       
       if (isMobile) {
         return (
           <Box>
             <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
               <TextField
                 fullWidth
                 placeholder="Search tools..."
                 onChange={(e) => onSearch(e.target.value)}
                 InputProps={{
                   startAdornment: <SearchIcon />,
                 }}
               />
               <IconButton
                 onClick={() => setFiltersOpen(true)}
                 sx={{ minWidth: 48 }}
               >
                 <FilterListIcon />
                 <Badge badgeContent={getActiveFilterCount()} color="primary" />
               </IconButton>
             </Box>
             
             <SwipeableDrawer
               anchor="bottom"
               open={filtersOpen}
               onClose={() => setFiltersOpen(false)}
               onOpen={() => setFiltersOpen(true)}
               disableSwipeToOpen={false}
               PaperProps={{
                 sx: { maxHeight: '70vh', borderRadius: '16px 16px 0 0' }
               }}
             >
               <MobileFilters
                 onFilter={onFilter}
                 onClose={() => setFiltersOpen(false)}
               />
             </SwipeableDrawer>
           </Box>
         );
       }
       
       return (
         <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
           <TextField
             placeholder="Search tools..."
             onChange={(e) => onSearch(e.target.value)}
             sx={{ flexGrow: 1 }}
             InputProps={{
               startAdornment: <SearchIcon />,
             }}
           />
           <DesktopFilters onFilter={onFilter} />
         </Box>
       );
     }
     ```

## 3. Advanced Mobile Features

**Offline Support and PWA Features:**
```typescript
// src/hooks/useOfflineSupport.ts
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<any[]>([]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const cacheData = useCallback((key: string, data: any) => {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, []);
  
  const getCachedData = useCallback((key: string, maxAge = 24 * 60 * 60 * 1000) => {
    try {
      const cached = localStorage.getItem(`offline_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error retrieving cached data:', error);
    }
    return null;
  }, []);
  
  return {
    isOnline,
    cacheData,
    getCachedData,
    offlineData,
  };
}

// src/components/mobile/PWAInstallPrompt.tsx
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };
  
  if (!showPrompt) return null;
  
  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={() => setShowPrompt(false)}
    >
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={handleInstall}>
            Install App
          </Button>
        }
        onClose={() => setShowPrompt(false)}
      >
        Install ToolVault for quick access and offline use
      </Alert>
    </Snackbar>
  );
}
```

**Mobile-Specific Performance Optimizations:**
```typescript
// src/hooks/useViewportOptimization.ts
export function useViewportOptimization() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const { isMobile } = useResponsive();
  
  useEffect(() => {
    if (isMobile) {
      // Handle mobile viewport changes (keyboard appearance)
      const handleResize = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        setViewportHeight(window.innerHeight);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isMobile]);
  
  return { viewportHeight };
}

// src/components/mobile/VirtualKeyboardHandler.tsx
export function VirtualKeyboardHandler({ children }: VirtualKeyboardHandlerProps) {
  const { isMobile } = useResponsive();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
  useEffect(() => {
    if (isMobile && 'visualViewport' in window) {
      const viewport = window.visualViewport!;
      
      const handleViewportChange = () => {
        const keyboardHeight = window.innerHeight - viewport.height;
        setKeyboardOpen(keyboardHeight > 100);
      };
      
      viewport.addEventListener('resize', handleViewportChange);
      return () => viewport.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobile]);
  
  return (
    <Box
      sx={{
        transition: 'padding-bottom 0.3s ease',
        paddingBottom: keyboardOpen ? '20px' : '0',
      }}
    >
      {children}
    </Box>
  );
}
```

## 4. Expected Output & Deliverables

**Success Criteria:**
- Seamless experience across desktop (>1200px), tablet (768-1199px), and mobile (<768px)
- Touch-friendly interactions with appropriate target sizes
- Swipe gestures for mobile navigation
- Connection-aware loading and data optimization
- Adaptive UI components that change based on screen size
- PWA capabilities with offline support
- Performance optimized for mobile networks
- Virtual keyboard handling

**Deliverables:**
1. **Responsive Infrastructure:**
   - `src/theme/responsive.ts` - Responsive theme and breakpoints
   - `src/hooks/useResponsive.ts` - Responsive utilities hook
   - `src/hooks/useConnectionAware.ts` - Connection awareness
   - `src/hooks/useOfflineSupport.ts` - Offline capabilities

2. **Mobile Components:**
   - `src/components/mobile/TouchInteractions.tsx` - Touch enhancements
   - `src/components/mobile/SwipeableToolCard.tsx` - Swipe gestures
   - `src/components/mobile/AdaptiveImageLoader.tsx` - Performance optimization
   - `src/components/mobile/PWAInstallPrompt.tsx` - PWA installation

3. **Adaptive Layouts:**
   - `src/components/layout/ResponsiveToolList.tsx` - Responsive tool grid
   - `src/components/adaptive/AdaptiveNavigation.tsx` - Responsive navigation
   - `src/components/adaptive/AdaptiveToolDetail.tsx` - Mobile-friendly detail view
   - `src/components/adaptive/AdaptiveSearch.tsx` - Responsive search interface

4. **Performance Features:**
   - `src/components/mobile/ProgressiveToolList.tsx` - Progressive loading
   - `src/components/mobile/VirtualKeyboardHandler.tsx` - Keyboard optimization
   - `src/hooks/useViewportOptimization.ts` - Viewport utilities
   - Connection-aware feature loading

## 5. Memory Bank Logging Instructions

**Instruction:** Upon successful completion, log your work to:
`Memory/Phase_4_Full_UI_Mock_Execution/Task_4.5_Responsive_Design_Log.md`

**Format:** Follow `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`. Include:
- Agent identifier (Agent_UI_Specialist)
- Task reference (Phase 4 / Task 4.5)
- Responsive design strategy and breakpoints
- Mobile interaction patterns implemented
- Performance optimization techniques
- PWA features and offline support
- Adaptive component architecture
- Cross-device testing results

Please acknowledge receipt and proceed with implementation.