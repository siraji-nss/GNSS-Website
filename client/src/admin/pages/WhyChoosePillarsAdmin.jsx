import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function WhyChoosePillarsAdmin() {
  return (
    <SimpleCollectionEditor
      title="Why Choose Us — Four Pillars"
      endpoint="/why-choose-pillars"
      fields={[
        { key: 'title', label: 'Pillar', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'sort_order', label: 'Order', type: 'number' },
      ]}
    />
  );
}
