import _ from 'underscore';
import ui, { spawn } from 'shared/ui';
import styles from './index.css';
import fontStyles from 'shared/fonts/fonts.css';
import Game from './components/Game';
import modalContainer from 'shared/ui/modal/modalContainer';

const rootComponent = spawn(document.getElementById('root'), undefined, { style: { width: '100%', height: '100%' } }, <Game />);

modalContainer.setParent(rootComponent);
