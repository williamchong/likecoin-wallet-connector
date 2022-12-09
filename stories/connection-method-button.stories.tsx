import React from 'react';
import { Meta, Story } from '@storybook/react';

import { IntlProvider } from '../src/i18n';
import { ConnectionMethodButton, Props } from '../src/components/connection-method-button';

const meta: Meta = {
  title: 'Connection Method Button',
  component: ConnectionMethodButton,
  argTypes: {
    name: {
      control: {
        type: 'text',
      },
    },
    type: {
      control: {
        type: 'select',
        options: [
          'keplr',
          'liker-id',
          'cosmostation',
        ],
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<Props> = args => (
  <IntlProvider language="en">
    <ConnectionMethodButton {...args} />;
  </IntlProvider>
)

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
