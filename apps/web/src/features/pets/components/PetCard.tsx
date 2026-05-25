"use client";

import { Card } from "@heroui/react";
import { type Pets } from "@reservacion-veterinaria/types";
import ActionsButtons, { ButtonAction } from "@/src/components/ActionsButton";
import { Bone, Weight } from "lucide-react";

interface PetCardProps {
  pet: Pets;
  actionButtons: ButtonAction[];
}

export default function PetCard({ pet, actionButtons }: PetCardProps) {
  const sexIcon = pet.sex === "male" ? "♂" : "♀";
  const sexColor = pet.sex === "male" ? "text-blue-500" : "text-pink-500";

  return (
    <Card className="group w-[200px] gap-2 shadow-none border hover:bg-zinc-100/50 transition">
      <div className="aspect-square rounded-2xl overflow-hidden w-full">
        <img
          alt="Indie Hackers community"
          className="object-cover h-full w-full group-hover:scale-105 transition duration-300"
          loading="lazy"
          src={pet.profilePhoto}
        />
      </div>

      <Card.Header>
        <Card.Title>
          {pet.name}
          <span className={sexColor}>{sexIcon}</span>{" "}
        </Card.Title>
        <Card.Description>{pet.species}</Card.Description>
      </Card.Header>
      <Card.Footer className="flex gap-2 justify-between">
        <div>
          <div className="text-xs flex gap-2 items-center mb-2">
            <Weight size={15} />
            <span>{pet.weight}kg</span>
          </div>

          <div className="text-xs flex gap-2 items-center">
            <Bone size={15} />
            <span className="text-xs">{pet.age} años</span>
          </div>
        </div>
        <ActionsButtons
          buttons={actionButtons?.map((btn) => ({
            ...btn,
            onClick: () => btn.onClick(pet.id),
          }))}
        />
      </Card.Footer>
    </Card>
  );
}
