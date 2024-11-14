// Importa la biblioteca de Google Generative AI y las dependencias de React necesarias
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import './Chatbot.css';  // Importa el archivo de estilos para el componente de Chatbot

// Inicializa la instancia de Google Generative AI con la clave de API desde variables de entorno
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);

export default function Chatbot() {
    // Define el estado de los mensajes del chat y la entrada del usuario
    const [messages, setMessages] = useState([]);  // Lista de mensajes en el chat
    const [userInput, setUserInput] = useState("");  // Mensaje de entrada del usuario
    const messagesEndRef = useRef(null);  // Referencia al final de la lista de mensajes para desplazar el scroll automáticamente

    // Define el modelo de generación que se usará
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Función para manejar el envío de mensajes del usuario
    const handleSubmit = async (e) => {
        e.preventDefault();  // Previene el comportamiento por defecto del formulario (recargar la página)

        // Crea un mensaje de usuario y lo agrega a la lista de mensajes
        const userMessage = { role: "user", parts: [{ text: userInput }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);  // Actualiza el estado con el nuevo mensaje del usuario
        setUserInput("");  // Limpia el campo de entrada del usuario

        // Mantiene el historial del chat, incluyendo el mensaje de contexto
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Juguemos un juego de rol, de aquí en adelante eres un Ingeniero de sistemas llamado Carlos, el cual es especialista en sistemas de información. Quiero que todas las respuestas las resumas a máximo 200 caracteres." }] },  // Mensaje de contexto inicial
                ...newMessages.map((msg) => ({
                    role: msg.role,
                    parts: msg.parts,
                })),  // Añade los mensajes previos
            ],
            generationConfig: {
                maxOutputTokens: 300,  // Máximo de tokens para cada respuesta del modelo
            },
        });

        // Envía el mensaje del usuario al modelo y guarda la respuesta en el estado
        const result = await chat.sendMessage(userInput);
        const response = await result.response;
        const botMessage = { role: "model", parts: [{ text: response.text() }] };

        // Actualiza el estado de los mensajes con la respuesta del bot
        setMessages([...newMessages, botMessage]);
    };

    // Efecto para desplazar automáticamente el scroll hacia el final del chat cuando cambian los mensajes
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });  // Desplazamiento suave hacia el final
        }
    }, [messages]);  // Se ejecuta cada vez que los mensajes cambian

    // Renderiza el componente del Chatbot
    return (
        <div className={"chat-container"}>
            <h1 className={"title"}>Chatbot</h1>
            <div className={"centered-form"}>
                <img className={"chat-img"} src="avatar.jpg" width={140} height={140} alt="" />
            </div>
            <div className={"center-text content"}>
                {messages.map((message, index) => (
                    <div key={index} className={message.role === "user" ? "user-message" : "bot-message"}>
                        {/* Renderiza el mensaje usando Markdown para formato de texto enriquecido */}
                        <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                    </div>
                ))}
                {/* Referencia para desplazamiento automático al final del chat */}
                <div ref={messagesEndRef} />
            </div>
            {/* Formulario para enviar mensajes */}
            <form className={"centered-form"} onSubmit={handleSubmit}>
                <textarea
                    className={"form-control"}
                    name="textAreaInput"
                    id="textAreaInput"
                    cols="70"
                    rows="2"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={"Escribe tu mensaje aquí"}>
                </textarea>
                <button type="submit" className={"button"}>Enviar</button>
            </form>
        </div>
    );
}