import './PlaylistSearch.scss'

import React from "react"
import { Form, InputGroup } from "react-bootstrap"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type PlaylistSearchProps = {
  onPlaylistSearch: (query: string) => void
  onPlaylistSearchCancel: () => Promise<any>
}

class PlaylistSearch extends React.Component<PlaylistSearchProps> {
  private searchField = React.createRef<HTMLInputElement>()

  state = {
    searchSubmitted: false,
    query: ""
  }

  clear() {
    this.setState(
      { searchSubmitted: false, query: "" },
      () => {
        if (this.searchField.current) {
          this.searchField.current.value = ""
        }
      }
    )
  }

  handleKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation()

    if (event.key === 'Enter') {
      this.submitSearch()

      event.preventDefault()
    } else if (event.key === 'Escape') {
      this.cancelSearch()
    }
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: event.target.value })
  }

  private submitSearch = () => {
    if (this.state.query.length > 0) {
      this.setState(
        { searchSubmitted: true },
        () => { this.props.onPlaylistSearch(this.state.query) }
      )
    }
  }

  private cancelSearch = () => {
    this.props.onPlaylistSearchCancel().then(() => {
      this.clear()

      if (this.searchField.current) {
        this.searchField.current.blur()
      }
    })
  }

  render() {
    const icon = (this.state.searchSubmitted)
      ? <FontAwesomeIcon icon={['fas', 'times']} size="sm" onClick={this.cancelSearch} className="closeIcon" />
      : <FontAwesomeIcon icon={['fas', 'search']} size="sm" onClick={this.submitSearch} className="searchIcon" />

    const className = this.state.query.length > 0 ? "search queryPresent" : "search"

    return (
      <Form className={className}>
        <InputGroup>
          <Form.Control type="text" role="searchbox" placeholder="Search" size="sm" onChange={this.handleChange} onKeyDown={this.handleKeyDown} ref={this.searchField} className="border-right-0 border" />
          <InputGroup.Append>
            <InputGroup.Text className="bg-transparent">
              {icon}
            </InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      </Form>
    )
  }
}

export default PlaylistSearch
