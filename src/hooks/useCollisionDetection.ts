import { useState, useEffect } from 'react';
import { Block } from '../types/builder';

interface CollisionState {
  isColliding: boolean;
  collidingWith: string[];
  repulsionForce: { x: number; y: number };
}

export function useCollisionDetection(blocks: Block[], activeBlockId: string | null) {
  const [collisionState, setCollisionState] = useState<CollisionState>({
    isColliding: false,
    collidingWith: [],
    repulsionForce: { x: 0, y: 0 }
  });

  const calculateRepulsionForce = (block1: Block, block2: Block) => {
    const centerX1 = block1.position.x + (block1.size?.width || 200) / 2;
    const centerY1 = block1.position.y + (block1.size?.height || 100) / 2;
    const centerX2 = block2.position.x + (block2.size?.width || 200) / 2;
    const centerY2 = block2.position.y + (block2.size?.height || 100) / 2;

    const dx = centerX1 - centerX2;
    const dy = centerY1 - centerY2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = 100; // Distancia mínima de repulsión

    if (distance < minDistance) {
      const force = (minDistance - distance) / minDistance;
      return {
        x: (dx / distance) * force * 10,
        y: (dy / distance) * force * 10
      };
    }

    return { x: 0, y: 0 };
  };

  useEffect(() => {
    if (!activeBlockId) {
      setCollisionState({
        isColliding: false,
        collidingWith: [],
        repulsionForce: { x: 0, y: 0 }
      });
      return;
    }

    const activeBlock = blocks.find(b => b.id === activeBlockId);
    if (!activeBlock) return;

    const collidingBlocks: string[] = [];
    let totalForceX = 0;
    let totalForceY = 0;

    blocks.forEach(block => {
      if (block.id === activeBlockId) return;

      const isColliding = checkCollision(activeBlock, block);
      if (isColliding) {
        collidingBlocks.push(block.id);
        const force = calculateRepulsionForce(activeBlock, block);
        totalForceX += force.x;
        totalForceY += force.y;
      }
    });

    setCollisionState({
      isColliding: collidingBlocks.length > 0,
      collidingWith: collidingBlocks,
      repulsionForce: { x: totalForceX, y: totalForceY }
    });
  }, [blocks, activeBlockId]);

  return collisionState;
}

function checkCollision(block1: Block, block2: Block): boolean {
  const rect1 = {
    left: block1.position.x,
    right: block1.position.x + (block1.size?.width || 200),
    top: block1.position.y,
    bottom: block1.position.y + (block1.size?.height || 100)
  };

  const rect2 = {
    left: block2.position.x,
    right: block2.position.x + (block2.size?.width || 200),
    top: block2.position.y,
    bottom: block2.position.y + (block2.size?.height || 100)
  };

  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
} 