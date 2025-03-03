import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function PollingPlatform() {
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: "", options: "" });
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const storedPolls = JSON.parse(localStorage.getItem("polls")) || [];
    setPolls(storedPolls);
  }, []);

  useEffect(() => {
    localStorage.setItem("polls", JSON.stringify(polls));
  }, [polls]);

  const createPoll = () => {
    const optionsArray = newPoll.options.split(",").map((opt) => opt.trim());
    if (!newPoll.question || optionsArray.length < 2) return;
    const poll = { id: Date.now(), question: newPoll.question, options: optionsArray, votes: Array(optionsArray.length).fill(0) };
    setPolls([...polls, poll]);
    setNewPoll({ question: "", options: "" });
  };

  const vote = (pollId, optionIndex) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId
          ? { ...poll, votes: poll.votes.map((v, i) => (i === optionIndex ? v + 1 : v)) }
          : poll
      )
    );
    setSelectedOptions({ ...selectedOptions, [pollId]: optionIndex });
  };

  const shareOnBluesky = (poll) => {
    const pollText = `${poll.question} \n${poll.options.map((opt, i) => `${i + 1}. ${opt}`).join("\n")} \nVote now!`;
    const blueskyLink = `https://bsky.app/share?text=${encodeURIComponent(pollText)}`;
    window.open(blueskyLink, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create a Poll</h2>
      <Input
        placeholder="Enter poll question"
        value={newPoll.question}
        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
        className="mb-2"
      />
      <Textarea
        placeholder="Enter options, separated by commas"
        value={newPoll.options}
        onChange={(e) => setNewPoll({ ...newPoll, options: e.target.value })}
        className="mb-2"
      />
      <Button onClick={createPoll} className="mb-4 w-full">Create Poll</Button>

      {polls.map((poll) => (
        <Card key={poll.id} className="mb-4">
          <CardContent>
            <h2 className="text-xl font-bold mb-2">{poll.question}</h2>
            {poll.options.map((option, index) => (
              <Button
                key={index}
                className="w-full mb-2"
                disabled={selectedOptions[poll.id] !== undefined}
                onClick={() => vote(poll.id, index)}
              >
                {option} ({poll.votes[index]} votes)
              </Button>
            ))}
            <Bar
              data={{
                labels: poll.options,
                datasets: [
                  {
                    label: "Votes",
                    data: poll.votes,
                    backgroundColor: "#4F46E5",
                  },
                ],
              }}
            />
            <Button onClick={() => shareOnBluesky(poll)} className="w-full mt-2">Share on Bluesky</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
