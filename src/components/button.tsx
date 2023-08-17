import classNames from 'classnames';
import React, { FC, HTMLAttributes } from 'react';

export interface ButtonProps
  extends HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
  tag?: 'button' | 'a';
  preset?: 'primary' | 'secondary';
  href?: string;
  rel?: string;
  target?: string;
}

/**
 * Button
 */
export const Button: FC<ButtonProps> = ({
  className,
  children,
  tag: Tag = 'button',
  preset = 'primary',
  ...props
}) => {
  const bgClass =
    preset === 'primary' ? 'lk-bg-like-cyan-light' : 'lk-bg-gray-light';
  const bgHoverClass =
    preset === 'primary' ? 'hover:lk-bg-like-cyan' : 'hover:lk-bg-gray';
  const textClass =
    preset === 'primary' ? 'lk-text-like-green' : 'lk-text-gray-dark';
  return (
    <Tag
      className={classNames(
        'lk-flex',
        'lk-items-center',
        'lk-justify-center',
        'lk-gap-[8px]',
        bgClass,
        bgHoverClass,
        textClass,
        'lk-rounded-[8px]',
        'lk-px-[16px]',
        'lk-py-[8px]',
        'lk-text-[16px]',
        'lk-font-bold',
        'lk-transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
