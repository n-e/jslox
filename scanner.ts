class Reader {
  data;
  position = 0;
  lastLc = { line: 1, col: 1 };
  lc = { line: 1, col: 1 };
  constructor(data: string) {
    this.data = data;
  }

  advance() {
    const item = this.data.at(this.position);
    this.position++;
    this.lastLc = { line: this.lc.line, col: this.lc.col };
    if (item === "\n") {
      this.lc.line++;
      this.lc.col = 1;
    } else {
      this.lc.col++;
    }
    return item;
  }
  peek() {
    return this.data.at(this.position);
  }
  peekNext() {
    return this.data.at(this.position + 1);
  }

  /** returns whether the next char matches, if so advance */
  match(char: string) {
    const matched = this.peek() === char;
    if (matched) this.advance();
    return matched;
  }
  isAtEnd() {
    return this.data.at(this.position) === undefined;
  }
}

interface TokenMeta {
  position: number;
  line: number;
  col: number;
}

interface StandardToken {
  type:
    | "LEFT_PAREN"
    | "RIGHT_PAREN"
    | "LEFT_BRACE"
    | "RIGHT_BRACE"
    | "COMMA"
    | "DOT"
    | "MINUS"
    | "PLUS"
    | "SEMICOLON"
    | "SLASH"
    | "STAR"
    | "BANG"
    | "BANG_EQUAL"
    | "EQUAL"
    | "EQUAL_EQUAL"
    | "GT"
    | "GTE"
    | "LT"
    | "LTE"
    | "EOF"
    // Keywords
    | "AND"
    | "CLASS"
    | "ELSE"
    | "FALSE"
    | "FUN"
    | "FOR"
    | "IF"
    | "NIL"
    | "OR"
    | "PRINT"
    | "RETURN"
    | "SUPER"
    | "THIS"
    | "TRUE"
    | "VAR"
    | "WHILE";
}
interface IdentifierToken {
  type: "IDENTIFIER";
  literal: string;
}
interface StringToken {
  type: "STRING";
  literal: string;
}
interface NumberToken {
  type: "NUMBER";
  literal: number;
}

type Token = StandardToken | IdentifierToken | StringToken | NumberToken;

export const scan = (data: string) => {
  const reader = new Reader(data);
  const tokens: (Token & TokenMeta)[] = [];
  const errors: { char: string; col: number; line: number }[] = [];

  const addToken = (t: StandardToken["type"]) =>
    tokens.push({
      type: t,
      position: reader.position,
      col: reader.lastLc.col,
      line: reader.lastLc.line,
    });
  const addXToken = (t: Token) => {
    tokens.push({
      ...t,
      position: reader.position,
      col: reader.lastLc.col,
      line: reader.lastLc.line,
    });
  };
  const addError = (char: string) =>
    errors.push({
      char,
      col: reader.lastLc.col,
      line: reader.lastLc.line,
    });

  while (true) {
    const c = reader.advance();
    switch (c) {
      case "(":
        addToken("LEFT_PAREN");
        break;
      case ")":
        addToken("RIGHT_PAREN");
        break;
      case "{":
        addToken("LEFT_BRACE");
        break;
      case "}":
        addToken("RIGHT_BRACE");
        break;
      case "}":
        addToken("RIGHT_BRACE");
        break;
      case ",":
        addToken("COMMA");
        break;
      case ".":
        addToken("DOT");
        break;
      case "-":
        addToken("MINUS");
        break;
      case "+":
        addToken("PLUS");
        break;
      case ";":
        addToken("SEMICOLON");
        break;
      case "/":
        addToken("SLASH");
        break;
      case "*":
        addToken("STAR");
        break;
      case "!":
        addToken(reader.match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        addToken(reader.match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case ">":
        addToken(reader.match("=") ? "GTE" : "GT");
        break;
      case "<":
        addToken(reader.match("=") ? "LTE" : "LT");
        break;
      case " ":
        break;
      case "\t":
        break;
      case "\n":
        break;
      case undefined:
        addToken("EOF");
        return { tokens, errors };
      default:
        const isAlpha = (t: string | undefined) =>
          t !== undefined && ((t >= "a" && t <= "z") || (t >= "A" && t <= "Z"));
        const isNum = (t: string | undefined) =>
          t !== undefined && t >= "0" && t <= "9";
        const isAlphaNum = (t: string | undefined) => isAlpha(t) || isNum(t);
        if (isAlpha(c)) {
          const pos0 = reader.position - 1;
          while (isAlphaNum(reader.peek())) reader.advance();
          const str = data.substring(pos0, reader.position);

          switch (str) {
            case "and":
              addToken("AND");
              break;
            case "class":
              addToken("CLASS");
              break;
            case "else":
              addToken("ELSE");
              break;
            case "false":
              addToken("FALSE");
              break;
            case "fun":
              addToken("FUN");
              break;
            case "for":
              addToken("FOR");
              break;
            case "if":
              addToken("IF");
              break;
            case "nil":
              addToken("NIL");
              break;
            case "or":
              addToken("OR");
              break;
            case "print":
              addToken("PRINT");
              break;
            case "return":
              addToken("RETURN");
              break;
            case "super":
              addToken("SUPER");
              break;
            case "this":
              addToken("THIS");
              break;
            case "true":
              addToken("TRUE");
              break;
            case "var":
              addToken("VAR");
              break;
            case "while":
              addToken("WHILE");
              break;
            default:
              addXToken({ type: "IDENTIFIER", literal: str });
              break;
          }
        } else if (isNum(c)) {
          const pos0 = reader.position - 1;
          while (isNum(reader.peek())) reader.advance();
          const str = data.substring(pos0, reader.position);
          addXToken({ type: "NUMBER", literal: Number.parseInt(str) });
        } else if (c === '"') {
          const pos0 = reader.position - 1;
          while (reader.peek() !== '"' && reader.peek() !== undefined)
            reader.advance();
          if (reader.peek() === '"') {
            reader.advance();
            const str = data.substring(pos0 + 1, reader.position - 1);
            addXToken({ type: "STRING", literal: str });
          } else addError(c);
        } else {
          addError(c);
        }
    }
  }
};
