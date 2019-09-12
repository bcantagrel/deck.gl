/* global document */
export function loadCss(url) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  document.getElementsByTagName('head')[0].appendChild(link);
}

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
export function hideMapboxCSSWarning() {
  const missingCssWarning = document.getElementsByClassName('mapboxgl-missing-css')[0];
  if (missingCssWarning) {
    missingCssWarning.style.display = 'none';
  }
}

export function updateDeck(inputJSON, {jsonConverter, deckConfig}) {
  const results = jsonConverter.convertJsonToDeckProps(inputJSON);
  deckConfig.setProps(results);
}

export function initDeck({mapboxApiKey, container, jsonInput}, onComplete, handleClick) {
  require(['mapbox-gl', 'h3', 'S2'], mapboxgl => {
    require(['deck.gl'], deckgl => {
      try {
        const layersDict = {};
        const layers = Object.keys(deckgl).filter(
          x => x.indexOf('Layer') > 0 && x.indexOf('_') !== 0
        );
        layers.map(k => (layersDict[k] = deckgl[k]));

        const jsonConverter = new deckgl.JSONConverter({
          configuration: {
            layers: layersDict
          }
        });

        const deckConfig = new deckgl.DeckGL({
          map: mapboxgl,
          mapboxApiAccessToken: mapboxApiKey,
          latitude: 0,
          longitude: 0,
          zoom: 1,
          onClick: handleClick,
          getTooltip,
          container,
          onLoad: () => updateDeck(jsonInput, {jsonConverter, deckConfig})
        });
        if (onComplete) {
          onComplete({jsonConverter, deckConfig});
        }
      } catch (err) {
        // This will fail in node tests
        // eslint-disable-next-line
        console.error(err);
      }
      return {};
    });
  });
}

let lastPickedObject;
let lastTooltip;

function getTooltip(pickedInfo) {
  if (!pickedInfo.picked) {
    return null;
  }
  if (pickedInfo.object === lastPickedObject) {
    return lastTooltip;
  }
  const tooltip = {
    html: tabularize(pickedInfo.object),
    style: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex',
      flex: 'wrap',
      maxWidth: '500px',
      flexDirection: 'column',
      zIndex: 2
    }
  };
  lastTooltip = tooltip;
  lastPickedObject = pickedInfo.object;
  return tooltip;
}

function tabularize(json) {
  const dataTable = document.createElement('div');
  dataTable.className = 'dataTable';

  for (const key in json) {
    const row = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'header';
    header.innerText = key;
    Object.assign(header.style, {
      fontWeight: 500,
      marginRight: '10px'
    });
    const value = document.createElement('div');
    value.className = 'value';
    value.innerText = JSON.stringify(json[key]);
    Object.assign(value.style, {
      float: 'right',
      margin: 'header'
    });
    value.style.margin = 'header';
    row.appendChild(header);
    row.appendChild(value);
    Object.assign(row.style, {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch'
    });
    dataTable.appendChild(row);
  }
  return dataTable.innerHTML;
}