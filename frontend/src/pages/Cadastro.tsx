import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { validarEmail, validarCpf, somenteNumeros, REGEX_SENHA } from "../utils/validacoes";
import { Input } from "../components/Input";
import { cadastrar } from "../services/autenticacao";
import { ApiError } from "../services/api";
import logo from "../assets/logo-escura.png";
import "./Auth.css";
import { Botao } from "../components/Botao";

interface Erros {
    nome?: string;
    email?: string;
    cpf?: string;
    senha?: string;
    confirmarSenha?: string;
}


export function Cadastro() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};

        if (nome.trim() === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.trim().length < 3) {
            novosErros.nome = "O nome deve ter pelo menos 3 caracteres.";
        }

        if (email === "") {
            novosErros.email = "Informe o e-mail.";
        } else if (!validarEmail(email)) {
            novosErros.email = "E-mail inválido.";
        }

        if (cpf === "") {
            novosErros.cpf = "Informe o CPF.";
        } else if (!validarCpf(cpf)) {
            novosErros.cpf = "CPF inválido.";
        }

        if (senha === "") {
            novosErros.senha = "Informe a senha.";
        } else if (senha.length < 8) {
            novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
        } else if (!REGEX_SENHA.test(senha)) {
            novosErros.senha =
                "Use letra maiúscula, minúscula, número e caractere especial.";
        }

        if (confirmarSenha === "") {
            novosErros.confirmarSenha = "Confirme a senha.";
        } else if (senha !== confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não conferem.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        setEnviando(true);
        try {
            await cadastrar({
                nome,
                email,
                cpf: somenteNumeros(cpf),
                senha,
                confirmacaoSenha: confirmarSenha,
            });
            navigate("/admin/login");
        } catch (erro) {
            if (erro instanceof ApiError) {
                setErroGeral(erro.message);
            } else {
                setErroGeral("Erro inesperado. Tente novamente.");
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <img src={logo} alt="Signus Som e Luz" className="auth-logo" />
                </div>

                <h1 className="auth-title">Criar conta</h1>

                <form onSubmit={handleSubmit} noValidate className="auth-form">
                    <Input
                        type="text"
                        placeholder="Nome completo"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        erro={erros.nome}
                    />

                    <Input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        erro={erros.email}
                    />

                    <Input
                        type="text"
                        placeholder="CPF"
                        value={cpf}
                        onChange={(event) => setCpf(event.target.value)}
                        erro={erros.cpf}
                    />

                    <Input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        erro={erros.senha}
                    />

                    <Input
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        erro={erros.confirmarSenha}
                    />

                    {erroGeral && (
                        <p role="alert" className="form-alert">
                            {erroGeral}
                        </p>
                    )}

                    <Botao type="submit" disabled={enviando}>
                        Cadastrar
                    </Botao>
                    
                </form>

                <p className="auth-footer">
                    Já tem conta? <Link to="/admin/login">Entrar</Link>
                </p>
            </div>
        </div>
    );
}