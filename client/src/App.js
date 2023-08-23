import React, { useEffect, useState } from "react";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
function App() {
  // Initialize backendData as an empty array
  const [backendData, setbackendData] = useState([]);

  useEffect(() => {
    fetch("https://task2-1wrd.onrender.com/api")
      .then((response) => response.json())
      .then((data) => setbackendData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  async function handleOnDragEnd(result) {
    if (!result.destination) return;

    // Create a copy of backendData and reorder locally
    const newItems = Array.from(backendData);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update the UI
    setbackendData(newItems);

    const orderedIds = newItems.map((item) => item.id);

    try {
      const response = await fetch(
        "https://task2-1wrd.onrender.com/api/reorder",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderedIds }),
        }
      );
      const data = await response.json();
      if (data.message !== "Order updated successfully") {
        // If the server response is not what we expect, revert the change
        console.error("Failed to update order: unexpected server response");
        setbackendData(backendData); // Revert to original backendData
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      setbackendData(backendData); // Revert to original backendData
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
                      <img
                        src={'https://task2-1wrd.onrender.com${item.image_path}'}
                        alt={item.name}
                        className="item-image"
                      />
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
