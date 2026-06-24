import React from "react"
import "./BlogPanel.css"

type BlogPanelProps = {
  title?: string
  paragraphs?: React.ReactNode[]
  onCtaClick?: () => void
}

const DEFAULT_TITLE = "How many homes have switched to clean cooking fuel?"

const DEFAULT_PARAGRAPHS: React.ReactNode[] = [
  <>
    Across much of the world, families still cook over open fires and stoves
    that burn wood, dung, coal, or kerosene. The smoke they breathe indoors is
    one of the leading  environmental risks to health.
  </>,
  <>
    The shift to clean fuels — LPG, electricity, and biogas — is one of the
    clearest markers of rising living standards.
    Between successive rounds of the National Family Health Survey, many
    states recorded sharp gains in the share of households cooking with clean
    fuel.
  </>,
  <>
    The charts on the right show this long-run change, letting you compare how
    access has shifted across sectors and surveys
    and see where progress has been fastest.
  </>,
]

export default function BlogPanel({
  title = DEFAULT_TITLE,
  paragraphs = DEFAULT_PARAGRAPHS,
  ctaLabel = "Learn more about clean cooking fuel",
  onCtaClick,
}: BlogPanelProps) {
  return (
    <aside className="ifc-blog">
      <h2 className="ifc-blog__title">{title}</h2>

      <div className="ifc-blog__body">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

    </aside>
  )
}
