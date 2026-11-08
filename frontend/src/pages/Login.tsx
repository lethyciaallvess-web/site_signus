import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { validarEmail } from "../utils/validacoes";
import { Input } from "../components/Input";
import { login } from "../services/autenticacao";
import { ApiError } from "../services/api";
import logo from "../assets/logo-clara.png";
import "./Auth.css";
import { Botao } from "../components/Botao";
import { useUsuario } from "../contexts/UsuarioContext";
import { rotaInicial } from "../utils/perfis";

export function Login() {
    const navigate = useNavigate();
    const { atualizarUsuario } = useUsuario();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erroEmail, setErroEmail] = useState("");
    const [erroSenha, setErroSenha] = useState("");
    const [erroGeral, setErroGeral] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        let temErro = false;

        if (email === "") {
            setErroEmail("Informe o e-mail.");
            temErro = true;
        } else if (!validarEmail(email)) {
            setErroEmail("E-mail inválido.");
            temErro = true;
        } else {
            setErroEmail("");
        }

        if (senha === "") {
            setErroSenha("Informe a senha.");
            temErro = true;
        } else if (senha.length < 8) {
            setErroSenha("A senha deve ter pelo menos 8 caracteres.");
            temErro = true;
        } else {
            setErroSenha("");
        }

        if (temErro) {
            return;
        }

        setEnviando(true);
        try {
            const usuario = await login(email, senha);
            atualizarUsuario(usuario);
            navigate(rotaInicial(usuario.perfil));
        } catch (erro) {
            setErroGeral(
                erro instanceof ApiError ? erro.message : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="auth-voltar">
                    ← Voltar ao site
                </Link>

                <div className="auth-brand">
                    <img src={logo} alt="Signus Som e Luz" className="auth-logo" />
                </div>

                <h1 className="auth-title">Entrar</h1>

                <p className="auth-aviso">
                    O acesso é liberado para clientes que já pediram orçamento à Signus.
                </p>

                <form onSubmit={handleSubmit} noValidate className="auth-form">
                    <Input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        erro={erroEmail}
                    />

                    <Input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        erro={erroSenha}
                    />

                    {erroGeral && (
                        <p role="alert" className="form-alert">
                            {erroGeral}
                        </p>
                    )}

                    <Botao type="submit" disabled={enviando}>
                        Entrar
                    </Botao>
                </form>

                <p className="auth-footer">
                    Primeiro acesso? <Link to="/cadastro">Ative sua conta</Link>
                </p>
                <p className="auth-footer">
                    Ainda não é cliente? <Link to="/orcamento">Peça seu orçamento</Link>
                </p>
            </div>
        </div>
    );
}