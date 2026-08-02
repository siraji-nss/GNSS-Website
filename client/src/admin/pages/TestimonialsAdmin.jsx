import SimpleCollectionEditor from '../SimpleCollectionEditor';

export default function TestimonialsAdmin() {
  return (
    <SimpleCollectionEditor
      title="Testimonials / Success Stories"
      endpoint="/testimonials"
      helpText="Replace the sample placeholders with real student success stories before launch."
      fields={[
        { key: 'name', label: 'Student Name', type: 'text' },
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'country', label: 'Country', type: 'text' },
        { key: 'image_url', label: 'Photo', type: 'image' },
        { key: 'sort_order', label: 'Order', type: 'number' },
      ]}
    />
  );
}
