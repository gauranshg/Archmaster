/**
 * C4 System Node Component
 *
 * Renders a system node for C4 model diagrams.
 */

import { memo } from 'react';
import { NodeProps } from 'reactflow';
import CustomNode from './CustomNode';
import type { NodeData } from '@/types';

const C4SystemNode = memo((props: NodeProps<NodeData>) => {
  const { data } = props;

  // Default HTML content for system node
  const htmlContent = data.htmlContent || `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="font-size: 32px;">🖥️</div>
      <div style="font-weight: 500;">${data.label}</div>
    </div>
  `;

  return (
    <CustomNode
      {...props}
      data={{ ...data, htmlContent }}
      cssClass="c4-system-node"
    />
  );
});

C4SystemNode.displayName = 'C4SystemNode';

export default C4SystemNode;
