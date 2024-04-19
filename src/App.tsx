import type { Edge, Node, OnConnect, NodeChange } from "reactflow";
import { useCallback, useState, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { PositionLoggerNode } from "./nodes/PositionLoggerNode";
import {edgeTypes} from "./edges";

interface ProcessData {
  nodes: Node[];
  nodeTypes: Record<string, unknown>;
  edges: Edge[];
  edgeTypes: Record<string, unknown>;
}

// Custom hook to fetch data from a URL
function useFetch<T>(url: string): [T | null, boolean] {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setData(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation: ', error);
        });
  }, [url]);

  return [data, isLoading];
}

export default function App() {
  // Fetch process data from server
  const [processData, isLoading] = useFetch<ProcessData>('/process.json');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Update nodes and edges when processData changes
  useEffect(() => {
    if (processData) {
      setNodes(processData.nodes);
      setEdges(processData.edges);
    }
  }, [processData]);

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    'position-logger': PositionLoggerNode,
    ...(processData?.nodeTypes),
  }), [processData]);

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => nds.map(node => {
      const change = changes.find(c => 'id' in c && c.id === node.id);
      if (change && 'id' in change) {
        return {...node, ...change};
      }
      return node;
    }));
  }, []);

  // Handle edge connections
  const onConnect: OnConnect = useCallback(
      (connection) => setEdges((eds) => addEdge(connection, eds)),
      []
  );

  // Save current state to server
  const onSave = useCallback(() => {
  const data = JSON.stringify({ nodes, edges });
  console.log('Sending POST request to /process.json with data:', data); // Add this line
  fetch('/process.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Save successful:', data);
  })
  .catch(error => {
    console.error('There was a problem with the save operation: ', error);
  });
}, [nodes, edges]);

  // Restore state from server
  const onRestore = useCallback(() => {
    setNodes(processData?.nodes || []);
    setEdges(processData?.edges || []);
  }, [processData]);

  // Generate a unique node ID
  const getNodeId = () => `randomnode_${+new Date()}`;

  // Add a new node
  const onAdd = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      type: 'default', // Change to appropriate type
      position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
      data: { label: 'New Node' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // Show loading screen while data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the React Flow diagram
  return (
  <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
    <div style={{ position: 'absolute', zIndex: 1, height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
    <div style={{ position: 'absolute', right: 20, top: 20, display: 'flex', gap: '10px', zIndex: 10 }}>
      <button style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }} onClick={onSave}>Save</button>
      <button style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2196F3', color: 'white', cursor: 'pointer' }} onClick={onRestore}>Restore</button>
      <button style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#f44336', color: 'white', cursor: 'pointer' }} onClick={onAdd}>Add Node</button>
    </div>
  </div>
);
}