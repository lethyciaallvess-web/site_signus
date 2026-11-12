import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { validarEmail, validarCpf, validarNome, somenteNumeros, REGEX_SENHA } from "../utils/validacoes";
import { mascararCpf, mascararNome } from "../utils/mascaras";
import { Input } from "../components/Input";
import { cadastrar } from "../services/autenticacao";
import { ApiError } from "../services/api";
import logo from "../assets/logo-clara.png";
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
        } else if (!validarNome(nome)) {
            novosErros.nome = "Use apenas letras no nome.";
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
            navigate("/login");
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
                <Link to="/" className="auth-voltar">
                    ← Voltar ao site
                </Link>

                <div className="auth-brand">
                    <img src={logo} alt="Signus Som e Luz" className="auth-logo" />
                </div>

                <h1 className="auth-title">Primeiro acesso</h1>

                <p className="auth-aviso">
                    Use o mesmo CPF e e-mail informados no seu orçamento. O acesso é liberado
                    apenas para clientes da Signus.
                </p>

                <form onSubmit={handleSubmit} noValidate className="auth-form">
                    <Input
                        type="text"
                        placeholder="Nome completo"
                        obrigatorio
                        maxLength={180}
                        value={nome}
                        onChange={(event) => setNome(mascararNome(event.target.value))}
                        erro={erros.nome}
                    />

                    <Input
                        type="email"
                        placeholder="E-mail"
                        obrigatorio
                        maxLength={255}
                        inputMode="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        erro={erros.email}
                    />

                    <Input
                        type="text"
                        placeholder="CPF"
                        obrigatorio
                        maxLength={14}
                        inputMode="numeric"
                        value={cpf}
                        onChange={(event) => setCpf(mascararCpf(event.target.value))}
                        erro={erros.cpf}
                    />

                    <Input
                        type="password"
                        placeholder="Senha"
                        obrigatorio
                        maxLength={72}
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        erro={erros.senha}
                    />

                    <Input
                        type="password"
                        placeholder="Confirmar senha"
                        obrigatorio
                        maxLength={72}
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
                        Ativar conta
                    </Botao>
                </form>

                <p className="auth-footer">
                    Já tem acesso? <Link to="/login">Entrar</Link>
                </p>
                <p className="auth-footer">
                    Ainda não é cliente? <Link to="/orcamento">Peça seu orçamento</Link>
                </p>
            </div>
        </div>
    );
}