import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../../components/Input";
import { Botao } from "../../components/Botao";
import { atualizarItem, buscarItem, criarItem } from "../../services/itens";
import { ApiError } from "../../services/api";

type FormItem = {
    codigo: string;
    nome: string;
    categoria: string;
    descricao: string;
    ativo: boolean;
};

type Erros = {
    codigo?: string;
    nome?: string;
    categoria?: string;
};

const formVazio: FormItem = {
    codigo: "",
    nome: "",
    categoria: "",
    descricao: "",
    ativo: true,
};

export function ItemForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormItem>(formVazio);
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(id !== undefined);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        let ativo = true;

        buscarItem(Number(id))
            .then((item) => {
                if (ativo) {
                    setForm({
                        codigo: item.codigo,
                        nome: item.nome,
                        categoria: item.categoria,
                        descricao: item.descricao ?? "",
                        ativo: item.ativo,
                    });
                    setCarregando(false);
                }
            })
            .catch((erroApi) => {
                if (ativo) {
                    setErroGeral(
                        erroApi instanceof ApiError
                            ? erroApi.message
                            : "Erro inesperado. Tente novamente."
                    );
                    setCarregando(false);
                }
            });

        return () => {
            ativo = false;
        };
    }, [id]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};
        const codigo = form.codigo.trim();
        const nome = form.nome.trim();
        const categoria = form.categoria.trim();

        if (codigo === "") {
            novosErros.codigo = "Informe o código.";
        } else if (codigo.length > 50) {
            novosErros.codigo = "O código deve ter no máximo 50 caracteres.";
        }

        if (nome === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.length < 3 || nome.length > 150) {
            novosErros.nome = "O nome deve ter entre 3 e 150 caracteres.";
        }

        if (categoria === "") {
            novosErros.categoria = "Informe a categoria.";
        } else if (categoria.length < 3 || categoria.length > 80) {
            novosErros.categoria = "A categoria deve ter entre 3 e 80 caracteres.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        const dados = {
            codigo,
            nome,
            categoria,
            descricao: form.descricao.trim(),
            ativo: form.ativo,
        };

        setEnviando(true);
        try {
            if (id === undefined) {
                await criarItem(dados);
            } else {
                await atualizarItem(Number(id), dados);
            }
            navigate("/admin/itens");
        } catch (erroApi) {
            setErroGeral(
                erroApi instanceof ApiError
                    ? erroApi.message
                    : "Erro inesperado. Tente novamente."
            );
        } finally {
            setEnviando(false);
        }
    }

    if (carregando) {
        return <p role="status">Carregando...</p>;
    }

    return (
        <div>
            <h1>{id === undefined ? "Novo item" : "Editar item"}</h1>

            <form onSubmit={handleSubmit} noValidate className="formulario">
                <Input
                    type="text"
                    placeholder="Código"
                    value={form.codigo}
                    onChange={(event) => setForm({ ...form, codigo: event.target.value })}
                    erro={erros.codigo}
                    disabled={id !== undefined}
                />

                <Input
                    type="text"
                    placeholder="Nome"
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: event.target.value })}
                    erro={erros.nome}
                />

                <Input
                    type="text"
                    placeholder="Categoria"
                    value={form.categoria}
                    onChange={(event) => setForm({ ...form, categoria: event.target.value })}
                    erro={erros.categoria}
                />

                <Input
                    type="text"
                    placeholder="Descrição"
                    value={form.descricao}
                    onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                />

                <label className="campo-check">
                    <input
                        type="checkbox"
                        checked={form.ativo}
                        onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
                    />
                    Ativo
                </label>

                {erroGeral && (
                    <p role="alert" className="form-alert">
                        {erroGeral}
                    </p>
                )}

                <div className="form-actions">
                    <Botao type="submit" disabled={enviando}>
                        Salvar
                    </Botao>
                    <Link to="/admin/itens">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}