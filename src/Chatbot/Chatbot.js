import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState } from "react";

// Accede a tu API Key desde las variables de entorno
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");

    // Inicializa el modelo Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 100,
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userMessage = { role: "user", parts: [{ text: userInput }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setUserInput("");

        // Envía el mensaje del usuario y recibe la respuesta
        const result = await chat.sendMessage(userInput);
        const response = await result.response;
        const botMessage = { role: "model", parts: [{ text: response.text() }] };

        // Actualiza el estado con el nuevo mensaje del bot
        setMessages([...newMessages, botMessage]);
    };

    return (
        <div className={"chat-container"}>
            <h1 className={"title"}>Chatbot</h1>
            <div className={"centered-form"}>
                <img className={"chat-img"} src="avatar.jpg" width={140} height={140} alt="" />
            </div>
            <div className={"center-text content"}>
                {messages.map((message, index) => (
                    <div key={index} className={message.role === "user" ? "user-message" : "bot-message"}>
                        {message.parts[0].text}
                    </div>
                ))}
            </div>
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
