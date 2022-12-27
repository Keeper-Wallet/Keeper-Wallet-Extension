import Prism from 'prismjs';

interface Props {
  code: string;
  language: string;
}

export function Highlight({ code, language }: Props) {
  return (
    <code
      className={`language-${language}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(code, Prism.languages[language], language),
      }}
    />
  );
}
