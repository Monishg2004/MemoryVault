// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./QueryPage.css";

// const QueryPage = () => {
//   const [conversations, setConversations] = useState([]);
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [queries, setQueries] = useState([]);
//   const [currentQuery, setCurrentQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);

//   const [isImageLoading, setIsImageLoading] = useState(false);

//   const [firstResponseImage, setFirstResponseImage] = useState(null);

//   const suggestedPrompts = [
//     "Tell me about a happy memory",
//     "Tell me about a time I spent with my family",
//     "What was my favorite childhood toy?",
//     "Describe a memorable vacation I took",
//   ];

//   useEffect(() => {
//     const savedConversations = JSON.parse(
//       localStorage.getItem("conversations") || "[]"
//     );
//     const sortedConversations = savedConversations.sort((a, b) => b.id - a.id);
//     setConversations(sortedConversations);

//     if (sortedConversations.length === 0) {
//       startNewConversation(true); // Pass true to indicate it's the initial load
//     } else {
//       setCurrentConversationId(sortedConversations[0].id);
//       setQueries(sortedConversations[0].queries);
//     }

//     // Always show the welcome screen when the page loads
//     setShowWelcome(true);
//   }, []);

//   const saveToLocalStorage = (updatedConversations) => {
//     localStorage.setItem("conversations", JSON.stringify(updatedConversations));
//   };

//   const startNewConversation = (isInitialLoad = false) => {
//     const newId = Date.now().toString();
//     const newConversation = { id: newId, queries: [] };
//     const updatedConversations = [newConversation, ...conversations];
//     setConversations(updatedConversations);
//     setCurrentConversationId(newId);
//     setQueries([]);
//     saveToLocalStorage(updatedConversations);

//     // Don't hide the welcome screen here
//     // if (!isInitialLoad) {
//     //   setShowWelcome(false);
//     // }
//   };

//   const deleteConversation = (id, event) => {
//     event.stopPropagation(); // Prevent triggering selectConversation
//     const updatedConversations = conversations.filter((conv) => conv.id !== id);
//     setConversations(updatedConversations);
//     saveToLocalStorage(updatedConversations);

//     if (id === currentConversationId) {
//       if (updatedConversations.length > 0) {
//         setCurrentConversationId(updatedConversations[0].id);
//         setQueries(updatedConversations[0].queries);
//       } else {
//         setCurrentConversationId(null);
//         setQueries([]);
//       }
//     }
//   };

//   const formatQueryHistory = (queries, newQuery) => {
//     let formattedHistory = queries
//       .map(
//         (item, index) =>
//           `query ${index + 1}:\n${item.query}\n\nresponse ${index + 1}:\n${
//             item.response
//           }\n\n`
//       )
//       .join("");

//     formattedHistory += `new query:\n${newQuery}`;
//     return formattedHistory;
//   };

//   const handlePromptClick = (prompt) => {
//     setShowWelcome(false);
//     startNewConversation();
//     setCurrentQuery(prompt);
//     handleSubmit(null, prompt);
//   };

//   const handleSubmit = async (e, manualPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryToSend = manualPrompt || currentQuery;
//     if (!queryToSend.trim()) return;

//     const newQuery = { query: queryToSend, response: null, isLoading: true };
//     const updatedQueries = [...queries, newQuery];
//     setQueries(updatedQueries);
//     setCurrentQuery("");
//     setIsLoading(true);

//     const formattedQuery = formatQueryHistory(queries, currentQuery);

//     try {
//       const response = await axios.get(
//         "http://localhost:8080/query",
//         {
//           params: { query: formattedQuery },
//         }
//       );

//       console.log(response);

//       const updatedQueriesWithResponse = updatedQueries.map((q, index) =>
//         index === updatedQueries.length - 1
//           ? { ...q, response: response.data, isLoading: false }
//           : q
//       );

//       setQueries(updatedQueriesWithResponse);

//       // Check if this is the first query and generate an image
//       if (queries.length === 0) {
//         setIsImageLoading(true);
//         try {
//           const imageResponse = await axios.get(
//             "http://localhost:8080/generateImage",
//             {
//               params: { llmResponse: response.data },
//             }
//           );
//           setFirstResponseImage(imageResponse.data);
//         } catch (error) {
//           console.error("Error generating image:", error);
//         } finally {
//           setIsImageLoading(false);
//         }
//       }

//       const updatedConversations = conversations.map((conv) =>
//         conv.id === currentConversationId
//           ? { ...conv, queries: updatedQueriesWithResponse }
//           : conv
//       );

//       setConversations(updatedConversations);
//       saveToLocalStorage(updatedConversations);
//     } catch (error) {
//       console.error("Error fetching response:", error);
//       setQueries(
//         updatedQueries.map((q, index) =>
//           index === updatedQueries.length - 1
//             ? { ...q, response: "Error fetching response", isLoading: false }
//             : q
//         )
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const selectConversation = (id) => {
//     setCurrentConversationId(id);
//     const selectedConversation = conversations.find((conv) => conv.id === id);
//     setQueries(selectedConversation.queries);
//     setShowWelcome(false);
//   };

//   const renderWelcomeOverlay = () => (
//     <div className="welcome-overlay">
//       <div className="welcome-content">
//         <h2>Welcome to MemoryVault</h2>
//         <p>Here are some suggested prompts to get started:</p>
//         <div className="suggested-prompts">
//           {suggestedPrompts.map((prompt, index) => (
//             <button
//               key={index}
//               onClick={() => handlePromptClick(prompt)}
//               className="prompt-btn"
//             >
//               {prompt}
//             </button>
//           ))}
//         </div>
//         <button
//           onClick={() => setShowWelcome(false)}
//           className="close-welcome-btn"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="memory-vault">
//       {showWelcome && renderWelcomeOverlay()}
//       <div className="sidebar">
//         <button onClick={startNewConversation} className="new-conversation-btn">
//           New Conversation
//         </button>
//         <div className="conversation-list">
//           {conversations.map((conv) => (
//             <div key={conv.id} className="conversation-item">
//               <button
//                 onClick={() => selectConversation(conv.id)}
//                 className={`conversation-btn ${
//                   currentConversationId === conv.id ? "active" : ""
//                 }`}
//               >
//                 {new Date(parseInt(conv.id)).toLocaleString()}
//               </button>
//               <button
//                 onClick={(e) => deleteConversation(conv.id, e)}
//                 className="delete-btn"
//               >
//                 ×
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="main-content">
//         <div className="conversation">
//           {queries.map((item, index) => (
//             <div key={index} className="query-response">
//               <p className="query">{item.query}</p>
//               {item.isLoading ? (
//                 <div className="loading-animation">Loading...</div>
//               ) : (
//                 <div className="response-container">
//                   {index === 0 && (isImageLoading || firstResponseImage) && (
//                     <div className="image-container">
//                       {isImageLoading ? (
//                         <div className="image-placeholder">
//                           <span>Loading image...</span>
//                         </div>
//                       ) : (
//                         <img
//                           src={firstResponseImage}
//                           alt="Generated from first response"
//                           className="first-response-image"
//                           onLoad={() => setIsImageLoading(false)}
//                         />
//                       )}
//                     </div>
//                   )}
//                   <p className="response">{item.response}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={handleSubmit} className="query-form">
//           <input
//             type="text"
//             value={currentQuery}
//             onChange={(e) => setCurrentQuery(e.target.value)}
//             placeholder="Enter your query, and remember..."
//             className="query-input"
//             disabled={isLoading}
//           />
//           <button type="submit" className="submit-button" disabled={isLoading}>
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default QueryPage;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./QueryPage.css";

// const QueryPage = () => {
//   const [conversations, setConversations] = useState([]);
//   const [currentConversationId, setCurrentConversationId] = useState(null);
//   const [queries, setQueries] = useState([]);
//   const [currentQuery, setCurrentQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(true);
//   const [isImageLoading, setIsImageLoading] = useState(false);
//   const [firstResponseImage, setFirstResponseImage] = useState(null);

//   const suggestedPrompts = [
//     "Tell me about a happy memory",
//     "Tell me about a time I spent with my family",
//     "What was my favorite childhood toy?",
//     "Describe a memorable vacation I took",
//   ];

//   useEffect(() => {
//     const savedConversations = JSON.parse(
//       localStorage.getItem("conversations") || "[]"
//     );
//     const sortedConversations = savedConversations.sort((a, b) => b.id - a.id);
//     setConversations(sortedConversations);

//     if (sortedConversations.length === 0) {
//       startNewConversation(true);
//     } else {
//       setCurrentConversationId(sortedConversations[0].id);
//       setQueries(sortedConversations[0].queries);
//     }

//     setShowWelcome(true);
//   }, []);

//   const saveToLocalStorage = (updatedConversations) => {
//     localStorage.setItem("conversations", JSON.stringify(updatedConversations));
//   };

//   const startNewConversation = (isInitialLoad = false) => {
//     const newId = Date.now().toString();
//     const newConversation = { id: newId, queries: [] };
//     const updatedConversations = [newConversation, ...conversations];
//     setConversations(updatedConversations);
//     setCurrentConversationId(newId);
//     setQueries([]);
//     saveToLocalStorage(updatedConversations);
//   };

//   const deleteConversation = (id, event) => {
//     event.stopPropagation();
//     const updatedConversations = conversations.filter((conv) => conv.id !== id);
//     setConversations(updatedConversations);
//     saveToLocalStorage(updatedConversations);

//     if (id === currentConversationId) {
//       if (updatedConversations.length > 0) {
//         setCurrentConversationId(updatedConversations[0].id);
//         setQueries(updatedConversations[0].queries);
//       } else {
//         setCurrentConversationId(null);
//         setQueries([]);
//       }
//     }
//   };

//   const handlePromptClick = (prompt) => {
//     setShowWelcome(false);
//     startNewConversation();
//     setCurrentQuery(prompt);
//     handleSubmit(null, prompt);
//   };

//   const handleSubmit = async (e, manualPrompt = null) => {
//     if (e) e.preventDefault();
//     const queryToSend = manualPrompt || currentQuery;
//     if (!queryToSend.trim()) return;

//     const newQuery = { query: queryToSend, response: null, isLoading: true };
//     const updatedQueries = [...queries, newQuery];
//     setQueries(updatedQueries);
//     setCurrentQuery("");
//     setIsLoading(true);

//     try {
//       const response = await axios.get(
//         "http://localhost:8080/query",
//         {
//           params: { query: queryToSend },
//         }
//       );

//       const updatedQueriesWithResponse = updatedQueries.map((q, index) =>
//         index === updatedQueries.length - 1
//           ? { ...q, response: response.data, isLoading: false }
//           : q
//       );

//       setQueries(updatedQueriesWithResponse);

//       if (queries.length === 0) {
//         setIsImageLoading(true);
//         try {
//           const imageResponse = await axios.get(
//             "http://localhost:8080/generateImage",
//             {
//               params: { llmResponse: response.data },
//             }
//           );
//           setFirstResponseImage(imageResponse.data);
//         } catch (error) {
//           console.error("Error generating image:", error);
//         } finally {
//           setIsImageLoading(false);
//         }
//       }

//       const updatedConversations = conversations.map((conv) =>
//         conv.id === currentConversationId
//           ? { ...conv, queries: updatedQueriesWithResponse }
//           : conv
//       );

//       setConversations(updatedConversations);
//       saveToLocalStorage(updatedConversations);
//     } catch (error) {
//       console.error("Error fetching response:", error);
//       setQueries(
//         updatedQueries.map((q, index) =>
//           index === updatedQueries.length - 1
//             ? { ...q, response: "Error fetching response", isLoading: false }
//             : q
//         )
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const selectConversation = (id) => {
//     setCurrentConversationId(id);
//     const selectedConversation = conversations.find((conv) => conv.id === id);
//     setQueries(selectedConversation.queries);
//     setShowWelcome(false);
//   };

//   const renderWelcomeOverlay = () => (
//     <div className="welcome-overlay">
//       <div className="welcome-content">
//         <h2>Welcome to MemoryVault</h2>
//         <p>Here are some suggested prompts to get started:</p>
//         <div className="suggested-prompts">
//           {suggestedPrompts.map((prompt, index) => (
//             <button
//               key={index}
//               onClick={() => handlePromptClick(prompt)}
//               className="prompt-btn"
//             >
//               {prompt}
//             </button>
//           ))}
//         </div>
//         <button
//           onClick={() => setShowWelcome(false)}
//           className="close-welcome-btn"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <div className="memory-vault">
//       {showWelcome && renderWelcomeOverlay()}
//       <div className="sidebar">
//         <button onClick={startNewConversation} className="new-conversation-btn">
//           New Conversation
//         </button>
//         <div className="conversation-list">
//           {conversations.map((conv) => (
//             <div key={conv.id} className="conversation-item">
//               <button
//                 onClick={() => selectConversation(conv.id)}
//                 className={`conversation-btn ${
//                   currentConversationId === conv.id ? "active" : ""
//                 }`}
//               >
//                 {new Date(parseInt(conv.id)).toLocaleString()}
//               </button>
//               <button
//                 onClick={(e) => deleteConversation(conv.id, e)}
//                 className="delete-btn"
//               >
//                 ×
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="main-content">
//         <div className="conversation">
//           {queries.map((item, index) => (
//             <div key={index} className="query-response">
//               <p className="query">{item.query}</p>
//               {item.isLoading ? (
//                 <div className="loading-animation">Loading...</div>
//               ) : (
//                 <div className="response-container">
//                   {index === 0 && (isImageLoading || firstResponseImage) && (
//                     <div className="image-container">
//                       {isImageLoading ? (
//                         <div className="image-placeholder">
//                           <span>Loading image...</span>
//                         </div>
//                       ) : (
//                         <img
//                           src={firstResponseImage}
//                           alt="Generated from first response"
//                           className="first-response-image"
//                           onLoad={() => setIsImageLoading(false)}
//                         />
//                       )}
//                     </div>
//                   )}
//                   {/* Fix: Handle object response properly */}
//                   <p className="response">
//                     {typeof item.response === "object"
//                       ? JSON.stringify(item.response)
//                       : item.response}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={handleSubmit} className="query-form">
//           <input
//             type="text"
//             value={currentQuery}
//             onChange={(e) => setCurrentQuery(e.target.value)}
//             placeholder="Enter your query, and remember..."
//             className="query-input"
//             disabled={isLoading}
//           />
//           <button type="submit" className="submit-button" disabled={isLoading}>
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default QueryPage;

import React, { useState, useEffect, useRef } from "react";
import "./QueryPage.css";
import { Sparkles, MessageSquare, PlusCircle, X, Send, Clock, Loader } from "lucide-react";
import axios from "axios";

const QueryPage = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [queries, setQueries] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const conversationEndRef = useRef(null);

  const suggestedPrompts = [
    "Tell me about a happy memory",
    "Tell me about a time I spent with my family",
    "What was my favorite childhood toy?",
    "Describe a memorable vacation I took",
  ];

  useEffect(() => {
    const savedConversations = JSON.parse(
      localStorage.getItem("conversations") || "[]"
    );
    const sortedConversations = savedConversations.sort((a, b) => b.id - a.id);
    setConversations(sortedConversations);

    if (sortedConversations.length === 0) {
      startNewConversation(true);
    } else {
      setCurrentConversationId(sortedConversations[0].id);
      setQueries(sortedConversations[0].queries);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [queries]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveToLocalStorage = (updatedConversations) => {
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));
  };

  const startNewConversation = (isInitialLoad = false) => {
    const newId = Date.now().toString();
    const newConversation = { id: newId, queries: [] };
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setCurrentConversationId(newId);
    setQueries([]);
    saveToLocalStorage(updatedConversations);
  };

  const deleteConversation = (id, event) => {
    event.stopPropagation();
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    saveToLocalStorage(updatedConversations);

    if (id === currentConversationId) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
        setQueries(updatedConversations[0].queries);
      } else {
        setCurrentConversationId(null);
        setQueries([]);
      }
    }
  };

  const handlePromptClick = (prompt) => {
    setShowWelcome(false);
    startNewConversation();
    setCurrentQuery(prompt);
    handleSubmit(null, prompt);
  };

  const selectConversation = (id) => {
    setCurrentConversationId(id);
    const selectedConversation = conversations.find((conv) => conv.id === id);
    setQueries(selectedConversation.queries);
    setShowWelcome(false);
  };

  const handleSubmit = async (e, manualPrompt = null) => {
    if (e) e.preventDefault();
    const queryToSend = manualPrompt || currentQuery;
    if (!queryToSend.trim()) return;

    const newQuery = {
      query: queryToSend,
      response: null,
      image: null,
      isLoading: true
    };

    const updatedQueries = [...queries, newQuery];
    setQueries(updatedQueries);
    setCurrentQuery("");
    setIsLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:8080/query",
        {
          params: { query: queryToSend },
        }
      );

      const updatedQueriesWithResponse = updatedQueries.map((q, index) =>
        index === updatedQueries.length - 1
          ? {
              ...q,
              response: response.data.text,
              image: response.data.image,
              isLoading: false
            }
          : q
      );

      setQueries(updatedQueriesWithResponse);

      const updatedConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, queries: updatedQueriesWithResponse }
          : conv
      );

      setConversations(updatedConversations);
      saveToLocalStorage(updatedConversations);
    } catch (error) {
      console.error("Error fetching response:", error);
      setQueries(
        updatedQueries.map((q, index) =>
          index === updatedQueries.length - 1
            ? { ...q, response: "Error fetching response", isLoading: false }
            : q
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeOverlay = () => (
    <div className="welcome-overlay">
      <div className="welcome-content">
        <div className="welcome-header">
          <Sparkles className="welcome-icon" size={32} />
          <h2>Welcome to MemoryVault</h2>
        </div>
        <p>Begin your journey down memory lane with these prompts:</p>
        <div className="suggested-prompts">
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="prompt-btn"
            >
              <MessageSquare size={16} />
              {prompt}
            </button>
          ))}
        </div>
        <button onClick={() => setShowWelcome(false)} className="close-welcome-btn">
          <X size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="memory-vault">
      {showWelcome && renderWelcomeOverlay()}
      <div className="sidebar">
        <button onClick={() => startNewConversation()} className="new-conversation-btn">
          <PlusCircle size={18} />
          <span>New Memory Journey</span>
        </button>
        <div className="conversation-list">
          {conversations.map((conv) => (
            <div key={conv.id} className="conversation-item">
              <button
                onClick={() => selectConversation(conv.id)}
                className={`conversation-btn ${
                  currentConversationId === conv.id ? "active" : ""
                }`}
              >
                <Clock size={14} />
                <span>{new Date(parseInt(conv.id)).toLocaleString()}</span>
              </button>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="delete-btn"
                aria-label="Delete conversation"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="conversation">
          {queries.map((item, index) => (
            <div key={index} className="query-response">
              <div className="query-bubble">
                <MessageSquare size={16} />
                <p>{item.query}</p>
              </div>
              {item.isLoading ? (
                <div className="loading-animation">
                  <Loader className="spin" size={20} />
                  <span>Retrieving memories...</span>
                </div>
              ) : (
                <div className="response-container">
                  {item.image && (
                    <div className="image-container">
                      <img
                        src={item.image}
                        alt="Generated memory visualization"
                        className="response-image"
                      />
                    </div>
                  )}
                  <div className="response-bubble">
                    <Sparkles size={16} />
                    <p>{typeof item.response === "object"
                      ? JSON.stringify(item.response)
                      : item.response}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={conversationEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="query-form">
          <input
            type="text"
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            placeholder="Ask about your memories..."
            className="query-input"
            disabled={isLoading}
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QueryPage;