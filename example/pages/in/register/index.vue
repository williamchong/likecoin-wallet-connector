<script>
export default {
  fetch({ redirect, query }) {
    const { code, method } = query;
    redirect(`/?code=${code}&method=${method}`)
  }
}
</script>