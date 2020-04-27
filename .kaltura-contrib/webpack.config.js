module.exports = (config, mode) => {
  // mode = production | dev (following the dev flag provided)
  return {
    ...config,
    externals: {...config.externals, preact: 'root KalturaPlayer.ui.preact'},
  };
};
