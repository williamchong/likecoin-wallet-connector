import React, { FC } from 'react';

import { ConnectionMethodIcon } from './connection-method-icon';

export interface Props {
  type?: string;
  name?: string;
  description?: string;
  onPress?: () => void;
}

/**
 * Button for a connection method
 */
export const ConnectionMethodButton: FC<Props> = ({
  type,
  name,
  description,
  onPress,
}) => {
  return (
    <button
      className="lk-block lk-w-full hover:lk-bg-[#d7ecec] lk-border-[4px] lk-border-[#ebebeb] hover:lk-border-[#50e3c2] lk-rounded-[16px] lk-p-[24px] lk-transition-colors lk-cursor-pointer lk-group"
      onClick={onPress}
    >
      <div className="lk-flex lk-items-center group-hover:lk-text-[#28646e]">
        <ConnectionMethodIcon type={type} />
        <div className="lk-ml-[12px] lk-font-bold">{name}</div>
      </div>
      <div className="lk-mt-[16px] lk-text-[16px] lk-text-left">
        {description}
      </div>
    </button>
  );
};
