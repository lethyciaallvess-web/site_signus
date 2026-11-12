import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../../components/Input";
import { Botao } from "../../components/Botao";
import { EditorItens } from "../../components/EditorItens";
import type { LinhaItem } from "../../components/EditorItens";
import { atualizarPlano, buscarPlano, criarPlano } from "../../services/planos";
import type { ItemPlano } from "../../services/planos";
import { listarItens } from "../../services/itens";
import { ApiError } from "../../services/api";
import { mascararMoeda, mascararTexto, moedaParaNumero } from "../../utils/mascaras";
import { validarTexto } from "../../utils/validacoes";

type FormPlano = {
    nome: string;
    descricao: string;
    valorBase: string;
    ativo: boolean;
};

type Erros = {
    nome?: string;
    itens?: string;
};

type Opcao = {
    valor: string;
    texto: string;
};

const formVazio: FormPlano = {
    nome: "",
    descricao: "",
    valorBase: "",
    ativo: true,
};

export function PlanoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormPlano>(formVazio);
    const [linhas, setLinhas] = useState<LinhaItem[]>([]);
    const [opcoes, setOpcoes] = useState<Opcao[]>([]);
    const [erros, setErros] = useState<Erros>({});
    const [erroGeral, setErroGeral] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            try {
                const [listaItens, plano] = await Promise.all([
                    listarItens(1, 100),
                    id === undefined ? Promise.resolve(null) : buscarPlano(Number(id)),
                ]);

                if (!ativo) return;

                setOpcoes(
                    listaItens.dados.map((item) => ({
                        valor: String(item.id),
                        texto: `${item.codigo} - ${item.nome}`,
                    }))
                );

                if (plano) {
                    setForm({
                        nome: plano.nome,
                        descricao: plano.descricao ?? "",
                        valorBase:
                            plano.valorBase === null
                                ? ""
                                : mascararMoeda(String(Math.round(plano.valorBase * 100))),
                        ativo: plano.ativo,
                    });
                    setLinhas(
                        plano.itens.map((item: ItemPlano) => ({
                            itemId: String(item.itemId),
                            quantidade: String(item.quantidade),
                        }))
                    );
                }
            } catch (erroApi) {
                if (ativo) {
                    setErroGeral(
                        erroApi instanceof ApiError
                            ? erroApi.message
                            : "Erro inesperado. Tente novamente."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setErroGeral("");

        const novosErros: Erros = {};
        const nome = form.nome.trim();

        if (nome === "") {
            novosErros.nome = "Informe o nome.";
        } else if (nome.length < 3 || nome.length > 80) {
            novosErros.nome = "O nome deve ter entre 3 e 80 caracteres.";
        } else if (!validarTexto(nome)) {
            novosErros.nome = "Use apenas letras, números, espaço, ponto, vírgula e hífen.";
        }

        const idsUsados = linhas.map((linha) => linha.itemId);

        if (linhas.some((linha) => linha.itemId === "")) {
            novosErros.itens = "Selecione o item em todas as linhas.";
        } else if (linhas.some((linha) => Number(linha.quantidade) < 1)) {
            novosErros.itens = "A quantidade deve ser no mínimo 1.";
        } else if (new Set(idsUsados).size !== idsUsados.length) {
            novosErros.itens = "Não repita o mesmo item.";
        }

        setErros(novosErros);

        if (Object.keys(novosErros).length > 0) {
            return;
        }

        const dados = {
            nome,
            descricao: form.descricao.trim(),
            valorBase: moedaParaNumero(form.valorBase),
            ativo: form.ativo,
            itens: linhas.map((linha) => ({
                itemId: Number(linha.itemId),
                quantidade: Number(linha.quantidade),
            })),
        };

        setEnviando(true);
        try {
            if (id === undefined) {
                await criarPlano(dados);
            } else {
                await atualizarPlano(Number(id), dados);
            }
            navigate("/admin/planos");
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
            <h1>{id === undefined ? "Novo plano" : "Editar plano"}</h1>

            <form onSubmit={handleSubmit} noValidate className="formulario">
                <Input
                    type="text"
                    placeholder="Nome"
                    obrigatorio
                    maxLength={80}
                    value={form.nome}
                    onChange={(event) => setForm({ ...form, nome: mascararTexto(event.target.value) })}
                    erro={erros.nome}
                />

                <Input
                    type="text"
                    placeholder="Descrição"
                    value={form.descricao}
                    onChange={(event) => setForm({ ...form, descricao: event.target.value })}
                />

                <Input
                    type="text"
                    placeholder="Valor base (opcional)"
                    value={form.valorBase}
                    onChange={(event) =>
                        setForm({ ...form, valorBase: mascararMoeda(event.target.value) })
                    }
                />

                <label className="campo-check">
                    <input
                        type="checkbox"
                        checked={form.ativo}
                        onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
                    />
                    Ativo
                </label>

                <h2>Itens do plano</h2>
                <EditorItens
                    linhas={linhas}
                    opcoes={opcoes}
                    onChange={setLinhas}
                    erro={erros.itens}
                />

                {erroGeral && (
                    <p role="alert" className="form-alert">
                        {erroGeral}
                    </p>
                )}

                <div className="form-actions">
                    <Botao type="submit" disabled={enviando}>
                        Salvar
                    </Botao>
                    <Link to="/admin/planos">Cancelar</Link>
                </div>
            </form>
        </div>
    );
}