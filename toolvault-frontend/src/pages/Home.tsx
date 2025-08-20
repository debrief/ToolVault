import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>ToolVault</h1>
        <p className="hero-subtitle">
          Portable, self-contained analysis tools for scientists, analysts, and
          developers
        </p>
        <div className="hero-description">
          <p>
            Discover and run curated collections of analysis tools with
            interactive browser-based interface, version awareness, and spatial
            output visualization.
          </p>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>📊 Analysis Tools</h3>
          <p>Comprehensive suite of data analysis and processing tools</p>
        </div>
        <div className="feature-card">
          <h3>🗺️ Spatial Visualization</h3>
          <p>Built-in support for GeoJSON and spatial data visualization</p>
        </div>
        <div className="feature-card">
          <h3>📦 Portable & Self-Contained</h3>
          <p>All tools packaged in portable bundles for offline operation</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Metadata-Driven UI</h3>
          <p>Dynamic interfaces generated from tool specifications</p>
        </div>
      </div>
    </div>
  );
}

export default Home;