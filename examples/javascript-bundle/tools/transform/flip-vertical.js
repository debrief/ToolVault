(function() {
  window.ToolVault = window.ToolVault || {};
  window.ToolVault.tools = window.ToolVault.tools || {};
  
  window.ToolVault.tools.flipVertical = function(input, params) {
    // Flip vertical is essentially flip horizontal on latitude axis
    const modifiedParams = { ...params, axis: 'latitude' };
    return window.ToolVault.tools.flipHorizontal(input, modifiedParams);
  };
})();