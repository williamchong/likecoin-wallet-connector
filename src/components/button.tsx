import classNames from 'classnames';
import React, { FC, HTMLAttributes } from 'react';

export interface ButtonProps
  extends HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
  tag: 'button' | 'a';
  href?: string;
  target?: string;
}

/**
 * Button
 */
export const Button: FC<ButtonProps> = ({
  className,
  children,
  tag: Tag = 'button',
  ...props
}) => {
  return (
    <Tag
      className={classNames(
        'lk-flex',
        'lk-items-center',
        'lk-justify-center',
        'lk-gap-[8px]',
        'lk-bg-like-cyan-light',
        'lk-text-like-green',
        'lk-rounded-[8px]',
        'lk-px-[16px]',
        'lk-py-[8px]',
        'lk-text-[16px]',
        'lk-font-bold',
        'hover:lk-bg-like-cyan',
        'lk-transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
