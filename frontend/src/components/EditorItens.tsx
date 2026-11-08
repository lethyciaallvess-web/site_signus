import { Select } from "./Select";
import { Input } from "./Input";
import { Botao } from "./Botao";
import "./EditorItens.css";

export type LinhaItem = {
    itemId: string;
    quantidade: string;
};

type Opcao = {
    valor: string;
    texto: string;
};

type EditorItensProps = {
    linhas: LinhaItem[];
    opcoes: Opcao[];
    onChange: (linhas: LinhaItem[]) => void;
    erro?: string;
};

export function EditorItens({ linhas, opcoes, onChange, erro }: EditorItensProps) {
    function alterar(indice: number, campo: Partial<LinhaItem>) {
        onChange(linhas.map((linha, i) => (i === indice ? { ...linha, ...campo } : linha)));
    }

    function remover(indice: number) {
        onChange(linhas.filter((_, i) => i !== indice));
    }

    function adicionar() {
        onChange([...linhas, { itemId: "", quantidade: "1" }]);
    }

    return (
        <div className="editor-itens">
            {linhas.length === 0 && <p className="editor-itens-vazio">Nenhum item adicionado.</p>}

            {linhas.map((linha, indice) => (
                <div key={indice} className="editor-itens-linha">
                    <Select
                        rotulo="Item"
                        value={linha.itemId}
                        onChange={(event) => alterar(indice, { itemId: event.target.value })}
                        opcoes={opcoes}
                        textoVazio="Selecione o item"
                    />
                    <Input
                        type="text"
                        placeholder="Qtd"
                        value={linha.quantidade}
                        onChange={(event) =>
                            alterar(indice, { quantidade: event.target.value.replace(/\D/g, "") })
                        }
                    />
                    <Botao type="button" variante="perigo" onClick={() => remover(indice)}>
                        Remover
                    </Botao>
                </div>
            ))}

            {erro && <span className="field-error">{erro}</span>}

            <Botao type="button" onClick={adicionar}>
                Adicionar item
            </Botao>
        </div>
    );
}