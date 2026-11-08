export const WHATSAPP_NUMERO = "+5544999792591";

export const WHATSAPP_MENSAGEM = "Olá! Gostaria de agendar um orçamento para o meu evento.";

export function linkWhatsapp(mensagem: string = WHATSAPP_MENSAGEM) {
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}