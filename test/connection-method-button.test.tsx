import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as ConnectionMethodButton } from '../stories/connection-method-button.stories';

describe('ConnectionMethodButton', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ConnectionMethodButton />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
