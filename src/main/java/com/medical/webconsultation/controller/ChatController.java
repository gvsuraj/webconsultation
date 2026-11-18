package com.medical.webconsultation.controller;

import com.medical.webconsultation.model.ChatMessage;
import com.medical.webconsultation.model.TypingStatus;
import com.medical.webconsultation.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private ChatMessageRepository chatRepo;

    /**
     * ✅ Relay WebRTC signaling between doctor and patient.
     */
    @MessageMapping("/signal/{consultationId}")
    @SendTo("/topic/signal/{consultationId}")
    public String relaySignal(@DestinationVariable String consultationId,
                              @Payload String signalData) {
        return signalData;
    }

    /**
     * ✅ Handles chat messages sent in a consultation.
     * Saves message to the database.
     */
    @MessageMapping("/chat/{consultationId}")
    @SendTo("/topic/chat/{consultationId}")
    public ChatMessage sendMessage(@DestinationVariable String consultationId,
                                   @Payload ChatMessage chatMessage) {
        chatMessage.setConsultationId(consultationId);
        chatMessage.setTimestamp(LocalDateTime.now());
        return chatRepo.save(chatMessage);
    }

    /**
     * ✅ Typing status notification in chat.
     */
    @MessageMapping("/chat/{consultationId}/typing")
    @SendTo("/topic/chat/{consultationId}/typing")
    public TypingStatus sendTyping(@DestinationVariable String consultationId,
                                   @Payload TypingStatus status) {
        return status;
    }

    /**
     * (Optional) Public chat message.
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendPublicMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    /**
     * (Optional) Add user to public chat.
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage,
                               SimpMessageHeaderAccessor accessor) {
        accessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }
}
