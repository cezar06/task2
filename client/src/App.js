import React, { useEffect, useState } from "react";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
function App() {
  // Initialize backendData as an empty array
  const [backendData, setbackendData] = useState([]);

  useEffect(() => {
    fetch("/api")
      .then((response) => response.json())
      .then((data) => setbackendData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  async function handleOnDragEnd(result) {
    if (!result.destination) return;
    const newItems = Array.from(backendData);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    const orderedIds = newItems.map((item) => item.id);

    try {
      const response = await fetch("/api/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await response.json();
      if (data.message === "Order updated successfully") {
        setbackendData(newItems);
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="items">
        {(provided) => (
          <ul
            className="item-container"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {backendData.length === 0 ? (
              <p>Loading</p>
            ) : (
              backendData.map((item, i) => (
                <Draggable key={i} draggableId={i.toString()} index={i}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className="item-box"
                    >
                      <p>{item.name}</p>
                    </li>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default App;
