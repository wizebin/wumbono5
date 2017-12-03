import component from '../component';

function getElementFromHtml(html) {
  const tempo = document.createElement('div');
  tempo.innerHTML = html;
  const ret = tempo.children[0];
  tempo.removeChild(ret);
  return ret;
}

export default class svg extends component {
  static getName() {
    return 'svg';
  }
  constructor(svgCode, parent, props, children) {
    super(getElementFromHtml(svgCode), parent, props, children);
  }
}
