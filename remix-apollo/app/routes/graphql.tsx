import { useQuery, gql } from '@apollo/client';

// const LIST_CLOSED_ISSUES = gql`
//   query listClosedIssues {
//     repository(owner:"octocat", name:"Hello-World") {
//         issues(last:20, states:CLOSED) {
//             edges {
//                 node {
//                     id
//                     title
//                     url
//                     labels(first:5) {
//                         edges {
//                             node {
//                                 name
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }
//   }
// `;

const LIST_VERSIONS = gql`
  query listVersions {
      versions {
          id
          name
      }
  }
`

export default function Graphql() {
  const { loading, error, data } = useQuery(LIST_VERSIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.versions.map(({ id, name }) => (
    <div key={id}>
      <h3>{name}</h3>
    </div>
  ));
}