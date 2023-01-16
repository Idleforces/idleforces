import "./info-box.css";

export const InfoBox = (props: {
  content: JSX.Element;
  topText: string;
  borderRadius?: string;
  contentPadding?: string;
}) => {
  const { content, topText } = props;
  const borderRadius = props.borderRadius ?? "0";
  const contentPadding = props.contentPadding;

  return (
    <div className="info-box" style={{ borderRadius }}>
      <div className="info-box-top">→ {topText}</div>
      <div
        className="info-box-content"
        style={contentPadding !== undefined ? { padding: contentPadding } : {}}
      >
        {content}
      </div>
    </div>
  );
};
