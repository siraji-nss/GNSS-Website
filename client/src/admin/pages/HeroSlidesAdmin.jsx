import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function HeroSlidesAdmin() {
  return (
    <SimpleCollectionEditor
      title="Homepage Hero Slides"
      endpoint="/hero-slides"
      helpText="These rotate at the top of the homepage."
      fields={[
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'subheadline', label: 'Subheadline', type: 'text' },
        { key: 'image_url', label: 'Background Image', type: 'image' },
        { key: 'cta_label', label: 'Button Label', type: 'text' },
        { key: 'cta_link', label: 'Button Link', type: 'text' },
        { key: 'sort_order', label: 'Order', type: 'number' },
        { key: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
